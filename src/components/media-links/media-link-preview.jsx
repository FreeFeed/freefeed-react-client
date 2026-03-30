import { useEffect, useId, useState } from 'react';
import { freefeedAttachmentId, IMAGE, useMediaLink, VIDEO } from './helpers';
import { getAttachmentInfo } from '../../services/batch-attachments-info';
import { attachmentPreviewUrl } from '../../services/api';
import { getDefaultAspectRatio, getVideoId, T_YOUTUBE_VIDEO } from '../link-preview/video';
import styles from './media-link-preview.module.scss';

export function MediaLinkPreview({ href: url }) {
  const previewId = useId();
  const [mediaType, handleClick] = useMediaLink(url, { previewId });
  const attId = freefeedAttachmentId(url);

  if (mediaType !== IMAGE && mediaType !== VIDEO && mediaType !== T_YOUTUBE_VIDEO) {
    return null;
  }

  // Freefeed attachment
  if (attId) {
    return (
      <a href={url} target="_blank" rel="noreferrer" onClick={handleClick}>
        <FreeFeedMediaPreview id={attId} previewId={previewId} />
      </a>
    );
  }

  if (mediaType === T_YOUTUBE_VIDEO) {
    return (
      <a href={url} target="_blank" rel="noreferrer" onClick={handleClick}>
        <YouTubeMediaPreview url={url} previewId={previewId} />
      </a>
    );
  }

  if (mediaType === VIDEO) {
    return null;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={handleClick}>
      <img
        src={url}
        alt=""
        width={90}
        height={90}
        className={styles.preview}
        loading="lazy"
        id={previewId}
      />
    </a>
  );
}

function FreeFeedMediaPreview({ id, previewId }) {
  const [attrs, setAttrs] = useState(null);

  useEffect(() => {
    getAttachmentInfo(id)
      .then((info) => {
        if (info?.mediaType === 'image' || info?.mediaType === 'video') {
          const height = 180;
          const w = info.width ?? info.imageSizes?.o?.w;
          const h = info.height ?? info.imageSizes?.o?.h;
          const width = w && h ? Math.round((w / h) * height) : height;
          const ar = w && h ? w / h : 1;
          const aspectType = ar >= 0.5 && ar <= 2 ? 'normal' : 'extreme';
          setAttrs({
            src: attachmentPreviewUrl(id, 'image', width, height),
            width,
            height,
            ar,
            aspectType,
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
      style={{ '--ar': attrs.ar }}
      data-aspect-type={attrs.aspectType}
      className={styles.preview}
      loading="lazy"
      id={previewId}
    />
  ) : null;
}

function YouTubeMediaPreview({ url, previewId }) {
  const aspectRatio = getDefaultAspectRatio(url);
  return (
    <img
      src={`https://img.youtube.com/vi/${getVideoId(url)}/default.jpg`}
      alt=""
      width={Math.round(90 / aspectRatio)}
      height={90}
      style={{ '--ar': 1 / aspectRatio }}
      className={styles.preview}
      loading="lazy"
      id={previewId}
    />
  );
}
