import { useCallback, useMemo } from 'react';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { faFilm as faVideo } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faYoutube, faVimeo } from '@fortawesome/free-brands-svg-icons';
import cn from 'classnames';
import { renderToString } from 'react-dom/server';
import { openLightbox } from '../services/lightbox';
import { Icon } from './fontawesome-icons';
import {
  canShowURL as isInstagram,
  getEmbedInfo as getInstagramEmbedInfo,
} from './link-preview/instagram';
import { T_YOUTUBE_VIDEO, getVideoInfo, getVideoType } from './link-preview/video';

export const getMediaType = (url) => {
  try {
    if (new URL(url).pathname.match(/\.(jpg|png|jpeg|webp|gif)$/i)) {
      return 'image';
    } else if (isInstagram(url)) {
      return 'instagram';
    }
    return getVideoType(url);
  } catch {
    // For some URLs in user input. the 'new URL' may throw error. Just return
    // null (unknown type) in this case.
    return null;
  }
};

export function MediaOpener({ url, mediaType, attachmentsRef, children }) {
  const media = useMemo(() => {
    const m = { url, mediaType };
    attachmentsRef.current.push(m);
    return m;
  }, [attachmentsRef, mediaType, url]);

  const openMedia = useCallback(
    (e) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      e.preventDefault();
      (async () => {
        const index = attachmentsRef.current.indexOf(media);
        openLightbox(
          index,
          await Promise.all(
            attachmentsRef.current.map(async ({ url, mediaType }) => {
              if (mediaType === 'image') {
                return {
                  // Convert dropbox page URL to image URL
                  src: url.replace(
                    'https://www.dropbox.com/s/',
                    'https://dl.dropboxusercontent.com/s/',
                  ),
                  type: 'image',
                  width: 100,
                  height: 100,
                  autoSize: true,
                };
              }
              return await getEmbeddableItem(url, mediaType);
            }),
          ),
        );
      })();
    },
    [attachmentsRef, media],
  );

  const mediaIcon =
    {
      instagram: faInstagram,
      T_YOUTUBE_VIDEO: faYoutube,
      T_VIMEO_VIDEO: faVimeo,
      image: faImage,
    }[mediaType] || faVideo;

  return (
    <a
      href={url}
      target="_blank"
      dir="ltr"
      onClick={openMedia}
      className={cn('media-link', mediaType)}
      title="Click to view in Lightbox"
    >
      <span className="icon-bond">
        <Icon icon={mediaIcon} className="media-icon" />
      </span>
      {children}
    </a>
  );
}

async function getEmbeddableItem(url, mediaType) {
  let info = null;
  if (isInstagram(url)) {
    info = getInstagramEmbedInfo(url);
  } else {
    info = await getVideoInfo(url, true);
  }

  if (info) {
    if (info.mediaURL) {
      return {
        src: info.mediaURL,
        width: info.width || 0,
        height: info.height || 0,
        type: 'image',
      };
    }

    let playerHTML = null;
    let width = 900;
    let height = 506;
    if (info.aspectRatio) {
      if (info.aspectRatio <= 1) {
        height = Math.round(width * info.aspectRatio);
      } else {
        height = 800;
        width = Math.round(height / info.aspectRatio);
      }
    }

    if (info.html) {
      playerHTML = info.html;
    } else {
      let player = null;
      if (info.playerURL) {
        player = (
          <iframe
            className="pswp-media__embed"
            src={info.playerURL}
            frameBorder="0"
            allowFullScreen={true}
            width={width}
            height={height}
            allow="autoplay"
          />
        );
      } else if (info.videoURL) {
        player = (
          <video
            className="pswp-media__embed"
            src={info.videoURL}
            poster={info.previewURL}
            controls={true}
            loop={true}
          />
        );
      }

      if (player) {
        playerHTML = renderToString(player);
      }
    }

    let onActivate = null;
    let onDeactivate = null;

    if (info.videoURL) {
      // Simple HTML5 video element play/pause
      onActivate = (element) => element.querySelector('video').play();
      onDeactivate = (element) => element.querySelector('video').pause();
    }
    if (mediaType === T_YOUTUBE_VIDEO) {
      // Youtube iframe initialization takes a lot of time, so we need to
      // complex logic here
      onActivate = function (element) {
        this.__active = true;
        const iframe = element.querySelector('iframe');
        const retry = (timeout) =>
          setTimeout(() => this.__active && onActivate.call(this, element), timeout);
        if (iframe.contentWindow) {
          // Iframe is ready
          if (!iframe.contentDocument) {
            // Document is inaccessible (so it has another domain). We can try to
            // play.
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo' }),
              'https://www.youtube.com',
            );
          }
          // Even if we trigger postMessage above, the full Youtube code may not
          // be loaded yet, so just repeat trying every 2 seconds, until the
          // slide is active.
          retry(2000);
        } else {
          // Iframe is not even initialized yet.
          retry(200);
        }
      };
      onDeactivate = function (element) {
        this.__active = false;
        const iframe = element.querySelector('iframe');
        iframe.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo' }),
          'https://www.youtube.com',
        );
      };
    }

    if (playerHTML) {
      let text = info.byline;
      if (text.length > 300) {
        text = `${text.slice(0, 200)}\u2026`;
      }
      const titleHTML = renderToString(
        <a href={url} target="_blank">
          {text || url}
        </a>,
      );
      return {
        type: 'html',
        html: `<div class="pswp-media__container">
          <div class="pswp-media__content" style="aspect-ratio: 1 / ${
            info?.aspectRatio ?? 1
          }">${playerHTML}</div>
          <div class="pswp-media__title">${titleHTML}</div>
        </div>`,
        width,
        height,
        mediaType,
        onActivate,
        onDeactivate,
      };
    }
  }
}
