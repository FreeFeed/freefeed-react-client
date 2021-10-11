import classnames from 'classnames';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import formatDistance from 'date-fns/formatDistance';

import { Icon } from '../../fontawesome-icons';

import styles from './comment-spacer.module.scss';

export function CommentSpacer({ className, from, to, isAboveCommentForm }) {
  const rootCn = classnames(className, styles.spacer);

  const fromDate = new Date(+from);
  const toDate = new Date(+to);
  const distance = formatDistance(fromDate, toDate);
  const word = isAboveCommentForm ? 'passed' : 'later';

  return (
    <div className={rootCn} aria-hidden>
      <div className={styles.icon}>
        <Icon icon={faClock} />
      </div>
      <div className={styles.body}>
        {distance} {word}
      </div>
    </div>
  );
}
