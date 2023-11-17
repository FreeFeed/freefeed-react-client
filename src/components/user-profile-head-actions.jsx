/* global CONFIG */
import { Link } from 'react-router';
import cn from 'classnames';
import { faClock } from '@fortawesome/free-regular-svg-icons';

import { Portal } from 'react-portal';
import menuStyles from './dropdown-menu.module.scss';
import { Throbber } from './throbber';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';

import styles from './user-profile-head.module.scss';
import { useDropDownKbd } from './hooks/drop-down-kbd';
import { CLOSE_ON_ANY_CLICK, BOTTOM_LEFT } from './hooks/drop-down';
import { MoreWithTriangle } from './more-with-triangle';
import { useShowBanDialog } from './dialog/ban-dialog';
import { useShowDisableBansDialog } from './dialog/disable-bans-dialog';

// eslint-disable-next-line complexity
export function UserProfileHeadActions({
  user,
  currentUser,
  isBanned,
  toggleBanned,
  inSubscriptions,
  isCurrentUserAdmin,
  doUnsubscribe,
  doSubscribe,
  doSendSubscriptionRequest,
  requestSent,
  doRevokeRequest,
  acceptsDirects,
  inSubscribers,
  unsubFromMe,
  togglePinned,
  isPinned,
  toggleHidden,
  toggleShowBans,
  isHidden,
}) {
  const showBanDialog = useShowBanDialog(user);
  const showDisableBansDialog = useShowDisableBansDialog(user, isCurrentUserAdmin);

  const allowToSubscribe =
    !CONFIG.privacyControlGroups.disableSubscriptions ||
    !CONFIG.privacyControlGroups.groups[user.username];

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
            {!user.isGone && !inSubscriptions && user.isPrivate === '0' && allowToSubscribe && (
              <li>
                <ActionLink {...doSubscribe}>Subscribe</ActionLink>
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
                  <ActionLink {...doSendSubscriptionRequest}>Request a subscription</ActionLink>
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
          {user.type === 'user' ? (
            <ul className={cn(styles.actionsList, styles.actionsListRight)}>
              {inSubscribers && currentUser.isPrivate === '1' && (
                <li>
                  <ActionLink {...unsubFromMe}>Remove from subscribers</ActionLink>
                </li>
              )}
              {!user.isGone && (
                <li>
                  <ActionLink {...toggleHidden}>{isHidden ? 'Unhide' : 'Hide'} in Home</ActionLink>
                </li>
              )}
              {!inSubscriptions && (
                <li>
                  <ActionLink onClick={showBanDialog} status={toggleBanned.status}>
                    Block user
                  </ActionLink>
                </li>
              )}
            </ul>
          ) : (
            <GroupActions>
              {(ref) => (
                <ul ref={ref} className={menuStyles.list}>
                  {!user.isGone && inSubscriptions && (
                    <>
                      <li className={menuStyles.item}>
                        <Link
                          className={menuStyles.link}
                          to={`/filter/direct?invite=${user.username}`}
                        >
                          Invite
                        </Link>
                      </li>
                      <li className={menuStyles.item}>
                        <ActionLink className={menuStyles.link} {...togglePinned}>
                          {isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                        </ActionLink>
                      </li>
                    </>
                  )}
                  {!user.isGone && (
                    <li className={menuStyles.item}>
                      <ActionLink className={menuStyles.link} {...toggleHidden}>
                        {isHidden ? 'Unhide' : 'Hide'} in Home
                      </ActionLink>
                    </li>
                  )}
                  {user.youCan.includes('disable_bans') && (
                    <li className={menuStyles.item}>
                      <ActionLink
                        className={menuStyles.link}
                        {...toggleShowBans}
                        onClick={showDisableBansDialog}
                      >
                        Show blocked content&hellip;
                      </ActionLink>
                    </li>
                  )}
                  {user.youCan.includes('undisable_bans') && (
                    <li className={menuStyles.item}>
                      <ActionLink className={menuStyles.link} {...toggleShowBans}>
                        Don&#x2019;t show blocked content
                      </ActionLink>
                    </li>
                  )}
                </ul>
              )}
            </GroupActions>
          )}
        </>
      )}
    </div>
  );
}

function ActionLink({ onClick, status = null, className, children }) {
  return (
    <>
      {status?.loading && <Throbber className={styles.actionLinkThrobber} />}
      <ButtonLink onClick={onClick} disabled={status?.loading} className={className}>
        {children}
      </ButtonLink>
    </>
  );
}

function GroupActions({ children }) {
  const { opened, toggle, pivotRef, menuRef } = useDropDownKbd({
    closeOn: CLOSE_ON_ANY_CLICK,
    position: BOTTOM_LEFT,
  });

  return (
    <>
      <ButtonLink ref={pivotRef} onClick={toggle} aria-haspopup aria-expanded={opened}>
        <MoreWithTriangle>Group actions</MoreWithTriangle>
      </ButtonLink>
      {opened && <Portal>{children(menuRef)}</Portal>}
    </>
  );
}
