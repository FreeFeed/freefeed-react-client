import { useEffect, useState } from 'react';
import { freefeedAttachmentId, IMAGE, useMediaLink, VIDEO } from './helpers';
import { getAttachmentInfo } from '../../services/batch-attachments-info';
import { attachmentPreviewUrl } from '../../services/api';
import { getDefaultAspectRatio, getVideoId, T_YOUTUBE_VIDEO } from '../link-preview/video';
import styles from './media-link-preview.module.scss';

export function MediaLinkPreview({ href: url }) {
  const [mediaType, handleClick] = useMediaLink(url);

  if (mediaType !== IMAGE && mediaType !== VIDEO && mediaType !== T_YOUTUBE_VIDEO) {
    return null;
  }

  // Freefeed attachment?
  const attId = freefeedAttachmentId(url);
  if (attId) {
    return (
      <a href={url} target="_blank" rel="noreferrer" onClick={handleClick}>
        <FreeFeedMediaPreview id={attId} />
      </a>
    );
  }

  if (mediaType === T_YOUTUBE_VIDEO) {
    return (
      <a href={url} target="_blank" rel="noreferrer" onClick={handleClick}>
        <YouTubeMediaPreview url={url} />
      </a>
    );
  }

  if (mediaType === VIDEO) {
    return null;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={handleClick}>
      <img src={url} alt="" width={60} height={60} className={styles.preview} loading="lazy" />
    </a>
  );
}

function FreeFeedMediaPreview({ id }) {
  const [attrs, setAttrs] = useState(null);

  useEffect(() => {
    getAttachmentInfo(id)
      .then((info) => {
        if (info?.mediaType === 'image' || info?.mediaType === 'video') {
          const height = 120;
          const width = Math.round((info.width / info.height) * height);
          setAttrs({
            src: attachmentPreviewUrl(id, 'image', width, height),
            width,
            height,
          });
        }
        return null;
      })
      .catch((err) => {
        // Just ignore
        // eslint-disable-next-line no-console
        console.error('Failed to get attachment info', id, err);
      });
  }, [id]);

  return attrs ? (
    <img
      src={attrs.src}
      alt=""
      width={attrs.width}
      height={attrs.height}
      style={{ '--ar': attrs.width / attrs.height }}
      className={styles.preview}
      loading="lazy"
    />
  ) : null;
}

function YouTubeMediaPreview({ url }) {
  const aspectRatio = getDefaultAspectRatio(url);
  return (
    <img
      src={`https://img.youtube.com/vi/${getVideoId(url)}/default.jpg`}
      alt=""
      width={Math.round(60 / aspectRatio)}
      height={60}
      style={{ '--ar': 1 / aspectRatio }}
      className={styles.preview}
      loading="lazy"
    />
  );
}
