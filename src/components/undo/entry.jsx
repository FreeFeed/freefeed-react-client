import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { useEffect, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { useDispatch } from 'react-redux';
import { Icon } from '../fontawesome-icons';
import { deleteUndoEntry, undoAction } from '../../redux/action-creators';
import styles from './styles.module.scss';
import { Counter } from './counter';

const ttl = 60;

export function Entry({ entry }) {
  const dispatch = useDispatch();
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const timeout = setTimeout(() => setExpired(true), (now - entry.created + ttl) * 1000);
    return () => clearTimeout(timeout);
  }, [entry.created]);

  const onUndoClick = useEvent(() => dispatch(undoAction(entry.subject, entry.token)));
  const onCloseClick = useEvent(() => dispatch(deleteUndoEntry(entry.id)));

  if (expired) {
    return null;
  }

  return (
    <li className={styles.entry}>
      <div className={styles.message}>{entry.message}</div>
      <div className={styles.button}>
        <button className="btn btn-primary btn-s" onClick={onUndoClick}>
          Undo <Counter from={entry.created} ttl={ttl} />
        </button>
      </div>
      <div>
        <button className="btn btn-link btn-xs" title="Close" onClick={onCloseClick}>
          <Icon icon={faTimesCircle} />
        </button>
      </div>
    </li>
  );
}
