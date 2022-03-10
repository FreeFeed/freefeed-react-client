import { Link } from 'react-router';
import cn from 'classnames';

import { pluralForm } from '../utils';
import styles from './user-profile-head.module.scss';

export const UserProfileHeadStats = ({ user, canFollowStatLinks }) => {
  const isNotGroup = user.type === 'user';

  const { username } = user;

  const subscriptions = parseInt(user.statistics.subscriptions);
  const subscribers = parseInt(user.statistics.subscribers);
  const comments = parseInt(user.statistics.comments);
  const likes = parseInt(user.statistics.likes);

  return (
    <div className={styles.stats}>
      {!user.isGone && user.statistics && (
        <ul className={styles.statsItems}>
          {isNotGroup && (
            <StatLink
              value={subscriptions}
              title="subscription"
              linkTo={`/${username}/subscriptions`}
              canFollow={canFollowStatLinks}
            />
          )}

          <StatLink
            value={subscribers}
            title="subscriber"
            linkTo={`/${username}/subscribers`}
            canFollow={canFollowStatLinks}
          />

          {isNotGroup && (
            <>
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
            </>
          )}
        </ul>
      )}
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
