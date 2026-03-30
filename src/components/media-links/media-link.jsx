import cn from 'classnames';
import { faInstagram, faVimeo, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { faFile, faFilePdf, faImage } from '@fortawesome/free-regular-svg-icons';
import { faFilm, faMusic } from '@fortawesome/free-solid-svg-icons';
import { T_VIMEO_VIDEO, T_YOUTUBE_VIDEO } from '../link-preview/video';
import { Icon } from '../fontawesome-icons';
import { IMAGE, INSTAGRAM, isAttachmentUrl, useMediaLink, VIDEO } from './helpers';

export function MediaLink({ href: url, children }) {
  const [mediaType, handleClick] = useMediaLink(url);

  let mediaIcon = {
    [INSTAGRAM]: faInstagram,
    [T_YOUTUBE_VIDEO]: faYoutube,
    [T_VIMEO_VIDEO]: faVimeo,
    [IMAGE]: faImage,
    [VIDEO]: faFilm,
  }[mediaType];

  let extension = '';
  if (!mediaType && isAttachmentUrl(url)) {
    const urlObj = new URL(url);
    const lastSegment = urlObj.pathname.split('/').pop();
    extension = lastSegment.includes('.') ? lastSegment.split('.').pop() : '';

    if (extension === 'mp3' || extension === 'm4a') {
      mediaIcon = faMusic;
    } else if (extension === 'pdf') {
      mediaIcon = faFilePdf;
    } else {
      mediaIcon = faFile;
    }
  }

  const mediaProps = mediaIcon
    ? {
        onClick: handleClick,
        className: cn('media-link', mediaType),
        title: 'Click to view in Lightbox',
      }
    : {};

  return (
    <a href={url} target="_blank" dir="ltr" rel="noreferrer" {...mediaProps}>
      {mediaIcon && (
        <span className="icon-bond">
          <Icon icon={mediaIcon} className="media-icon" />
        </span>
      )}
      {children}
      {extension && `.${extension}`}
    </a>
  );
}
