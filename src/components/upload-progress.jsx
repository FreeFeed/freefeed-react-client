import { useCallback } from 'react';
import cn from 'classnames';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { useSelector, useDispatch } from 'react-redux';

import { resetAttachmentUpload } from '../redux/action-creators';
import styles from './upload-progress.module.scss';
import { Icon } from './fontawesome-icons';
import { ButtonLink } from './button-link';

export function UploadProgress({ uploadIds }) {
  if (uploadIds.length === 0) {
    return null;
  }
  return (
    <div className={styles.container}>
      {uploadIds.map((id) => (
        <UploadProgressRow key={id} id={id} />
      ))}
    </div>
  );
}

function UploadProgressRow({ id }) {
  const dispatch = useDispatch();
  const remove = useCallback(() => dispatch(resetAttachmentUpload(id)), [dispatch, id]);

  const uploads = useSelector((state) => state.attachmentUploads);
  const statuses = useSelector((state) => state.attachmentUploadStatuses);

  return (
    <div className={cn(styles.row, statuses[id].error && styles.rowError)}>
      <div className={styles.name}>{uploads[id].name}</div>
      {statuses[id].error ? (
        <>
          <ButtonLink className={styles.closeIcon} onClick={remove} data-id={id}>
            <Icon icon={faTimesCircle} />
          </ButtonLink>
          <div className={cn(styles.error)}>
            <Icon icon={faExclamationTriangle} /> {statuses[id].errorText}
          </div>
        </>
      ) : (
        <div className={styles.progress} style={{ width: `${statuses[id].progress * 100}%` }} />
      )}
    </div>
  );
}
