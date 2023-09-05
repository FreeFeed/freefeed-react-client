import { useCallback, useMemo } from 'react';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { faFilm as faVideo } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faYoutube, faVimeo } from '@fortawesome/free-brands-svg-icons';
import cn from 'classnames';
import { Icon } from './fontawesome-icons';

export function MediaOpener({ url, mediaType, attachmentsRef, showMedia, children }) {
  const media = useMemo(() => {
    const m = { url, id: 'comment', mediaType };
    attachmentsRef.current.push(m);
    return m;
  }, [attachmentsRef, mediaType, url]);

  const openMedia = useCallback(
    (e) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      e.preventDefault();
      showMedia({
        attachments: attachmentsRef.current,
        index: attachmentsRef.current.indexOf(media),
      });
    },
    [attachmentsRef, media, showMedia],
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
