import { Link } from 'react-router';
import cn from 'classnames';

import { useSelector } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from 'react';
import { pluralForm } from '../utils';
import styles from './user-profile-head.module.scss';
import TimeDisplay from './time-display';
import UserName from './user-name';
import { Icon } from './fontawesome-icons';
import { useWaiting } from './hooks/waiting';

export const UserProfileHeadStats = ({ user, canFollowStatLinks }) => {
  const loadStatus = useSelector((state) => state.userStatsStatus);
  const statistics = useSelector((state) => state.userStats);
  const invitedBy = useSelector((state) => state.invitedByMap[user.username]);
  const waiting = useWaiting(1000);

  const { username, createdAt, type } = user;

  // Longest (in decimal digits) value of stats
  const maxDigits = useMemo(
    () =>
      loadStatus.success
        ? Object.keys(statistics).reduce((acc, key) => {
            if (statistics[key] === null) {
              return acc;
            }
            const len = statistics[key].toString(10).length;
            return Math.max(len, acc);
          }, 0)
        : 0,
    [loadStatus.success, statistics],
  );

  return (
    <div className={styles.stats}>
      <ul className={styles.statsItems}>
        {loadStatus.error && (
          <div>
            <Icon icon={faExclamationTriangle} /> {loadStatus.errorText}
          </div>
        )}
        {loadStatus.loading && !waiting && <div>Loading...</div>}
        {loadStatus.success && (
          <>
            <StatLink
              value={statistics.subscriptions}
              title="subscription"
              linkTo={`/${username}/subscriptions`}
              canFollow={canFollowStatLinks}
              maxDigits={maxDigits}
            />
            <StatLink
              value={statistics.subscribers}
              title="subscriber"
              linkTo={`/${username}/subscribers`}
              canFollow={canFollowStatLinks}
              maxDigits={maxDigits}
            />
            <StatLink
              value={statistics.posts}
              title="post"
              linkTo={
                type === 'user'
                  ? `/search?q=${encodeURIComponent(`from:${username}`)}`
                  : `/${username}`
              }
              canFollow={canFollowStatLinks}
              className={type === 'user' && styles.allPosts}
              maxDigits={maxDigits}
            />
            <StatLink
              value={statistics.comments}
              title="comment"
              linkTo={`/${username}/comments`}
              canFollow={canFollowStatLinks}
              maxDigits={maxDigits}
            />
            <StatLink
              value={statistics.likes}
              title="like"
              linkTo={`/${username}/likes`}
              canFollow={canFollowStatLinks}
              maxDigits={maxDigits}
            />
          </>
        )}
        <li className={styles.statlink}>
          <span className={styles.statlinkText}>
            <span className={styles.registeredOn}>Since</span>{' '}
            <TimeDisplay inline timeStamp={parseInt(createdAt)} absolute dateOnly />
          </span>
        </li>
        {invitedBy && (
          <li className={styles.statlink}>
            <span className={styles.statlinkText}>
              <span className={styles.invitedBy}>Invited by</span>{' '}
              <UserName user={{ username: invitedBy }}>@{invitedBy}</UserName>
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};

function StatLink({ value, title, linkTo, canFollow, className, maxDigits }) {
  if (value === null) {
    return null;
  }

  const sValue = value.toString(10);
  const rValue = (
    <>
      {maxDigits > sValue.length && (
        <span aria-hidden={true} className={styles.leftPad}>
          {'0'.repeat(maxDigits - sValue.length)}
        </span>
      )}
      {sValue}
    </>
  );
  let content = (
    <>
      {rValue} {pluralForm(value, title, null, 'w')}
    </>
  );

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
