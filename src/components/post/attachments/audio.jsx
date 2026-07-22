import cn from 'classnames';
import { faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { useRef } from 'react';
import { attachmentPreviewUrl } from '../../../services/api';
import { formatFileSize } from '../../../utils';
import style from './attachments.module.scss';
import { OriginalLink } from './original-link';
import { useStoredMediaVolume } from './visual/hooks';

export function AudioAttachment({ attachment: att, removeAttachment }) {
  const audioRef = useRef(null);
  useStoredMediaVolume(audioRef);

  const formattedFileSize = formatFileSize(att.fileSize);

  const title =
    [att.meta?.['dc:creator'], att.meta?.['dc:relation.isPartOf'], att.meta?.['dc:title']]
      .filter(Boolean)
      .join(' – ') || att.fileName;

  const titleAndSize = `${title} (${formattedFileSize})`;

  return (
    <div
      role="figure"
      className={cn(style['attachment'], style['attachment--audio'])}
      aria-label={`Audio attachment ${titleAndSize}`}
    >
      <OriginalLink attachment={att} icon={faHeadphones} removeAttachment={removeAttachment}>
        {title}
      </OriginalLink>
      <div>
        <audio
          ref={audioRef}
          className={style['audio__player']}
          src={attachmentPreviewUrl(att.id, 'audio')}
          title={titleAndSize}
          preload="none"
          controls
        />
      </div>
    </div>
  );
}
