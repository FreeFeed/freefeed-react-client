import { Link } from 'react-router';
import cn from 'classnames';

import { pluralForm } from '../utils';
import styles from './user-profile-head.module.scss';
import TimeDisplay from './time-display';

export const UserProfileHeadStats = ({ user, canFollowStatLinks }) => {
  if (user.isGone || !user.statistics) {
    return null;
  }

  const { username, createdAt, statistics, type } = user;
  const isUser = type === 'user';

  const subscriptions = parseInt(statistics.subscriptions);
  const subscribers = parseInt(statistics.subscribers);
  const comments = parseInt(statistics.comments);
  const likes = parseInt(statistics.likes);

  if (!isUser) {
    return (
      <div className={styles.stats}>
        <ul className={styles.statsItems}>
          <StatLink
            value={subscribers}
            title="subscriber"
            linkTo={`/${username}/subscribers`}
            canFollow={canFollowStatLinks}
          />
          <li className={styles.statlink}>
            <span className={styles.statlinkText}>
              <span className={styles.registeredOn}>Since</span>{' '}
              <TimeDisplay inline timeStamp={parseInt(createdAt)} absolute dateOnly />
            </span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.stats}>
      <ul className={styles.statsItems}>
        <StatLink
          value={subscriptions}
          title="subscription"
          linkTo={`/${username}/subscriptions`}
          canFollow={canFollowStatLinks}
        />
        <StatLink
          value={subscribers}
          title="subscriber"
          linkTo={`/${username}/subscribers`}
          canFollow={canFollowStatLinks}
        />
        <StatLink
          title="All posts"
          linkTo={`/search?q=${encodeURIComponent(`from:${username}`)}`}
          canFollow={canFollowStatLinks}
          className={styles.allPosts}
        />
        <StatLink
          value={comments}
          title="comment"
          linkTo={`/${username}/comments`}
          canFollow={canFollowStatLinks}
        />
        <StatLink
          value={likes}
          title="like"
          linkTo={`/${username}/likes`}
          canFollow={canFollowStatLinks}
        />
        <li className={styles.statlink}>
          <span className={styles.statlinkText}>
            <span className={styles.registeredOn}>Since</span>{' '}
            <TimeDisplay inline timeStamp={parseInt(createdAt)} absolute dateOnly />
          </span>
        </li>
      </ul>
    </div>
  );
};

function StatLink({ value, title, linkTo, canFollow, className }) {
  let content;

  if (typeof value === 'undefined') {
    content = title;
  } else if (typeof value === 'number') {
    if (value < 0) {
      return null;
    }

    content = pluralForm(value, title);
  }

  if (canFollow) {
    content = (
      <Link to={linkTo} className={styles.statlinkText}>
        {content}
      </Link>
    );
  } else {
    content = <span className={styles.statlinkText}>{content}</span>;
  }

  return <li className={cn(styles.statlink, className)}>{content}</li>;
}
