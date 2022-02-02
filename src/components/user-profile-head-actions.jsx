import { Link } from 'react-router';
import cn from 'classnames';
import { faClock } from '@fortawesome/free-regular-svg-icons';

import { Throbber } from './throbber';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';

import styles from './user-profile-head.module.scss';

// eslint-disable-next-line complexity
export function UserProfileHeadActions(props) {
  const {
    user,
    currentUser,
    isBanned,
    toggleBanned,
    inSubscriptions,
    isCurrentUserAdmin,
    doUnsubscribe,
    subscrFormPivotRef,
    subscrFormToggle,
    requestSent,
    doRevokeRequest,
    acceptsDirects,
    inSubscribers,
    unsubFromMe,
    togglePinned,
    isPinned,
    toggleHidden,
    isHidden,
  } = props;

  return (
    <div className={styles.actions}>
      {isBanned ? (
        // User is banned so the only action is to unban
        <ul className={styles.actionsList}>
          <li>
            <ActionLink {...toggleBanned}>Unblock</ActionLink>
          </li>
        </ul>
      ) : (
        <>
          {/*
           * Left block is for main/positive actions:
           * Subscribe/Unsubscribe, Send request, Direct message (for users)
           */}
          <ul className={styles.actionsList}>
            {inSubscriptions && !isCurrentUserAdmin && (
              <li>
                <ActionLink {...doUnsubscribe}>Unsubscribe</ActionLink>
              </li>
            )}
            {!user.isGone && !inSubscriptions && user.isPrivate === '0' && (
              <li>
                <ButtonLink ref={subscrFormPivotRef} onClick={subscrFormToggle}>
                  Subscribe
                </ButtonLink>
              </li>
            )}
            {!user.isGone && !inSubscriptions && user.isPrivate === '1' && (
              <li>
                {requestSent ? (
                  <>
                    <Icon icon={faClock} /> Request sent (
                    <ActionLink {...doRevokeRequest}>revoke</ActionLink>)
                  </>
                ) : (
                  <ButtonLink ref={subscrFormPivotRef} onClick={subscrFormToggle}>
                    Request a subscription
                  </ButtonLink>
                )}
              </li>
            )}
            {user.type === 'user' && acceptsDirects && (
              <li>
                <Link to={`/filter/direct?to=${user.username}`}>Direct message</Link>
              </li>
            )}
            {isCurrentUserAdmin && (
              <>
                <li>
                  <Link to={`/${user.username}/settings`}>Group settings</Link>
                </li>
                <li>
                  <Link to={`/${user.username}/manage-subscribers`}>Manage members</Link>
                </li>
              </>
            )}
          </ul>
          {/*
           * Right block is for secondary or negative actions:
           * Ban (for users), Hide in Home, Unsubscribe from me, Pin/unpin group
           */}
          <ul className={cn(styles.actionsList, styles.actionsListRight)}>
            {inSubscribers && currentUser.isPrivate === '1' && (
              <li>
                <ActionLink {...unsubFromMe}>Remove from subscribers</ActionLink>
              </li>
            )}
            {!user.isGone && user.type === 'group' && inSubscriptions && (
              <>
                <li>
                  <Link to={`/filter/direct?invite=${user.username}`}>Invite</Link>
                </li>
                <li>
                  <ActionLink {...togglePinned}>
                    {isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                  </ActionLink>
                </li>
              </>
            )}
            {!user.isGone && (
              <li>
                <ActionLink {...toggleHidden}>{isHidden ? 'Unhide' : 'Hide'} in Home</ActionLink>
              </li>
            )}
            {user.type === 'user' && !inSubscriptions && (
              <li>
                <ActionLink {...toggleBanned}>Block user</ActionLink>
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

function ActionLink({ onClick, status = null, children }) {
  return (
    <>
      {status?.loading && <Throbber className={styles.actionLinkThrobber} />}
      <ButtonLink onClick={onClick} disabled={status?.loading}>
        {children}
      </ButtonLink>
    </>
  );
}
