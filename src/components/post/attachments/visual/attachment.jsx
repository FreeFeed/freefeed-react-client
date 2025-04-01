import cn from 'classnames';
import { useEvent } from 'react-use-event-hook';
import { faPlay, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { attachmentPreviewUrl } from '../../../../services/api';
import { formatFileSize } from '../../../../utils';
import { Icon } from '../../../fontawesome-icons';
import { usePixelRatio } from '../../../hooks/pixel-ratio';
import { useScreenWidth } from '../../../hooks/screen-width';
import {
  PREVIEW_ANIMATION_ALWAYS,
  PREVIEW_ANIMATION_HOVER,
  PREVIEW_ANIMATION_NONE,
} from '../../../../utils/feed-options';
import style from './visual.module.scss';
import { NsfwCanvas } from './nsfw-canvas';
import { fitIntoBox } from './geometry';
import { useStopVideo } from './hooks';

// eslint-disable-next-line complexity
export function VisualAttachment({
  attachment: att,
  pictureId,
  width,
  height,
  handleClick: givenClickHandler,
  removeAttachment,
  isNSFW,
}) {
  const nameAndSize = `${att.fileName} (${formatFileSize(att.fileSize)}, ${att.width}×${att.height}px)`;
  const alt = `${att.mediaType === 'image' ? 'Image' : 'Video'} attachment ${att.fileName}`;

  const { width: mediaWidth, height: mediaHeight } = fitIntoBox(att, width, height);

  // Don't update preview URLs if the size hasn't changed by more than the minimum size difference
  const [prvWidth, prvHeight] = useDampedSize(mediaWidth, mediaHeight);

  const pixRatio = usePixelRatio();

  const { inlinePlaying, isGifLike } = useVideoProps(att, isNSFW, mediaWidth, mediaHeight);
  const animationType = useAnimationType(isGifLike);

  const handleMouseEnter = useEvent((e) => {
    if (
      !inlinePlaying &&
      window.matchMedia?.('(hover: hover)').matches &&
      animationType === PREVIEW_ANIMATION_HOVER
    ) {
      e.target.play();
    }
  });
  const handleMouseLeave = useEvent((e) => {
    if (
      !inlinePlaying &&
      window.matchMedia?.('(hover: hover)').matches &&
      animationType === PREVIEW_ANIMATION_HOVER
    ) {
      e.target.pause();
      e.target.currentTime = 0;
    }
  });

  const videoRef = useRef(null);
  useStopVideo(videoRef, att.mediaType === 'video' && !att.meta?.inProgress);
  const { videoPlaying, currentTime } = useVideoEvents(videoRef);

  const handleClick = useEvent((e) => {
    if (inlinePlaying && videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      e.preventDefault();
    } else {
      givenClickHandler(e);
    }
  });

  const handleRemove = useEvent((e) => {
    e.stopPropagation();
    e.preventDefault();
    removeAttachment?.(att.id);
  });

  const imageSrc = attachmentPreviewUrl(att.id, 'image', pixRatio * prvWidth, pixRatio * prvHeight);
  const videoSrc = attachmentPreviewUrl(att.id, 'video', pixRatio * prvWidth, pixRatio * prvHeight);
  const videoMaxSrc = attachmentPreviewUrl(att.id, 'video');

  useFullscreenVideo(videoRef, videoSrc, videoMaxSrc);

  const withVideoPlayer =
    att.mediaType === 'video' &&
    !isNSFW &&
    (inlinePlaying || animationType !== PREVIEW_ANIMATION_NONE);

  return (
    <a
      role="figure"
      className={cn(
        style['attachment'],
        style[`attachment--${att.mediaType}`],
        style[`attachment--animation--${animationType}`],
        inlinePlaying && style['attachment--inline-video'],
        videoPlaying && style['attachment--playing'],
      )}
      href={attachmentPreviewUrl(att.id, 'original')}
      title={nameAndSize}
      onClick={handleClick}
      target="_blank"
      data-pid={pictureId}
      style={{ width, height }}
    >
      {att.meta?.inProgress ? (
        <div className={style['processing']}>
          <Icon icon={faSpinner} className={style['processing__icon']} />
          <span>processing</span>
        </div>
      ) : (
        <>
          {/**
           * This image is used for the proper lightbox opening animation,
           * even if the attachment has 'video' type.
           */}
          <img
            id={pictureId}
            className={style['image']}
            src={imageSrc}
            alt={alt}
            loading="lazy"
            width={mediaWidth}
            height={mediaHeight}
            aria-hidden={att.mediaType === 'video'}
          />
          {withVideoPlayer && (
            <video
              ref={videoRef}
              className={cn(style['video'])}
              src={videoSrc}
              poster={imageSrc}
              alt={alt}
              loading="lazy"
              width={mediaWidth}
              height={mediaHeight}
              preload={!inlinePlaying ? 'auto' : 'none'}
              muted={!inlinePlaying || att.meta?.silent}
              loop={!inlinePlaying || isGifLike}
              autoPlay={!inlinePlaying && animationType === PREVIEW_ANIMATION_ALWAYS}
              controls={inlinePlaying}
              playsInline
              disablePictureInPicture
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          )}
          {isNSFW && !removeAttachment && (
            <NsfwCanvas aspectRatio={prvWidth / prvHeight} src={imageSrc} />
          )}
          {att.mediaType === 'video' && <Icon icon={faPlay} className={style['play-icon']} />}
        </>
      )}
      {att.mediaType === 'video' && !inlinePlaying && (
        <div className={cn(style['overlay'], style['overlay--time'])}>
          {isGifLike ? <span>GIF</span> : null}
          {animationType !== PREVIEW_ANIMATION_ALWAYS && formatTime(att.duration - currentTime)}
        </div>
      )}
      {removeAttachment && (
        <button
          className={cn(style['overlay'], style['overlay--remove'], style['overlay--button'])}
          onClick={handleRemove}
        >
          <Icon icon={faTimes} />
        </button>
      )}
    </a>
  );
}

function formatTime(duration) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration) % 60;

  return `${hours ? `${hours.toString()}:` : ''}${hours ? minutes.toString().padStart(2, '0') : minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
}

function useVideoProps(att, isNSFW, width, height) {
  const isGifLike =
    att.mediaType === 'video' &&
    (att.meta?.animatedImage || (att.meta?.silent && att.duration <= 10));

  const screenWidth = useScreenWidth();
  const inlinePlaying =
    att.mediaType === 'video' &&
    !isGifLike &&
    !isNSFW &&
    (width > 0.75 * screenWidth || width * height > 100000);

  return { inlinePlaying, isGifLike };
}

function useVideoEvents(videoRef) {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) {
      return;
    }
    const abortController = new AbortController();
    const { signal } = abortController;
    el.addEventListener('timeupdate', (e) => setCurrentTime(Math.floor(e.target.currentTime)), {
      signal,
    });
    el.addEventListener('pause', () => setVideoPlaying(false), { signal });
    el.addEventListener('play', () => setVideoPlaying(true), { signal });
    el.addEventListener('ended', () => (el.currentTime = 0), { signal });

    return () => abortController.abort();
  }, [videoRef]);
  return { currentTime, videoPlaying };
}

function useDampedSize(mediaWidth, mediaHeight, minDifference = 40) {
  const [prvWidth, setPrvWidth] = useState(mediaWidth);
  const [prvHeight, setPrvHeight] = useState(mediaHeight);

  useLayoutEffect(() => {
    // Don't update preview URLs if the size hasn't changed by more than the minimum size difference
    if (
      Math.abs(mediaWidth - prvWidth) < minDifference &&
      Math.abs(mediaHeight - prvHeight) < minDifference
    ) {
      return;
    }
    setPrvWidth(mediaWidth);
    setPrvHeight(mediaHeight);
  }, [prvWidth, prvHeight, mediaWidth, mediaHeight, minDifference]);

  return [prvWidth, prvHeight];
}

function useFullscreenVideo(videoRef, inlineSrc, fullscreenSrc) {
  useEffect(() => {
    const el = videoRef.current;
    if (!el) {
      return;
    }
    const h = () => {
      const { paused, currentTime } = el;
      if (document.fullscreenElement) {
        el.src = fullscreenSrc;
      } else {
        el.src = inlineSrc;
      }
      el.load();
      el.currentTime = currentTime;
      if (!paused) {
        el.play();
      }
    };

    el.addEventListener('fullscreenchange', h);
    return () => el.removeEventListener('fullscreenchange', h);
  }, [fullscreenSrc, inlineSrc, videoRef]);
}

function useAnimationType(isGifLike) {
  const animationPref = useSelector(
    (state) => state.user.frontendPreferences.previewAnimation[isGifLike ? 'gif' : 'video'],
  );

  const possibleAnimations = isGifLike
    ? [PREVIEW_ANIMATION_HOVER, PREVIEW_ANIMATION_ALWAYS]
    : [PREVIEW_ANIMATION_HOVER];

  return possibleAnimations.includes(animationPref) ? animationPref : PREVIEW_ANIMATION_NONE;
}
