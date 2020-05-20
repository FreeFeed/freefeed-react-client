/* global CONFIG */
import React, { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, withRouter } from 'react-router';
import cn from 'classnames';
import {
  faGlobeAmericas,
  faUserFriends,
  faLock,
  faBan,
  faCheckCircle,
  faCheckSquare,
} from '@fortawesome/free-solid-svg-icons';
import {
  faSmile,
  faCheckCircle as faCheckCircleO,
  faClock,
} from '@fortawesome/free-regular-svg-icons';

import { pluralForm } from '../utils';
import { initialAsyncState } from '../redux/async-helpers';
import {
  getUserInfo,
  showMedia,
  togglePinnedGroup,
  hideByName,
  unsubscribe,
  subscribe,
  ban,
  unban,
  sendSubscriptionRequest,
  unsubscribeFromMe,
} from '../redux/action-creators';
import { withKey } from './with-key';
import { UserPicture } from './user-picture';

import styles from './user-profile-head.module.scss';
import { Throbber } from './throbber';
import { Icon } from './fontawesome-icons';
import PieceOfText from './piece-of-text';
import { ButtonLink } from './button-link';

export const UserProfileHead = withRouter(
  withKey(({ router }) => router.params.userName)(function UserProfileHead({ router }) {
    const username = router.params.userName.toLowerCase();
    const dispatch = useDispatch();
    const dataStatus = useSelector(
      (state) => state.getUserInfoStatuses[username] || initialAsyncState,
    );
    const routeLoadingState = useSelector((state) => state.routeLoadingState);

    const currentUser = useSelector((state) => (state.user.id ? state.user : null));
    const user = useSelector((state) =>
      Object.values(state.users).find((u) => u.username === username),
    );
    const acceptsDirects = useSelector((state) => state.directsReceivers[username]);
    const isNotFound = useSelector((state) => state.usersNotFound.includes(username));

    // Handle the situation when the current user is logged out on this page
    const isLoggedOut = !user && dataStatus.success;

    const {
      isCurrentUser,
      inSubscriptions,
      inSubscribers,
      isBanned,
      isCurrentUserAdmin,
      requestSent,
      isHidden,
      isPinned,
    } = useMemo(
      () => ({
        isCurrentUser: user && currentUser && currentUser.id === user.id,
        inSubscriptions: user && currentUser?.subscriptions.includes(user.id),
        inSubscribers: user && Boolean(currentUser?.subscribers.find((s) => s.id === user.id)),
        isBanned: user && currentUser?.banIds.includes(user.id),
        isCurrentUserAdmin: user?.administrators?.includes(currentUser?.id),
        requestSent: currentUser?.pendingSubscriptionRequests.includes(user?.id),
        isHidden: currentUser?.frontendPreferences.homefeed.hideUsers.includes(user?.username),
        isPinned: currentUser?.frontendPreferences.pinnedGroups.includes(user?.id),
      }),
      [user, currentUser],
    );

    // Load user data
    useEffect(() => void ((isLoggedOut || dataStatus.initial) && dispatch(getUserInfo(username))), [
      isLoggedOut,
      dataStatus.initial,
      dispatch,
      username,
    ]);

    const canFollowStatLinks =
      user && !isBanned && (isCurrentUser || user.isPrivate === '0' || inSubscriptions);

    // Actions & statuses
    const doShowMedia = useCallback((arg) => dispatch(showMedia(arg)), [dispatch]);

    const toggleSubscribed = {
      onClick: useCallback(() => {
        if (
          inSubscriptions &&
          !confirm(`Are you sure you want to unsubscribe from @${user.username}?`)
        ) {
          return;
        }
        dispatch(
          (inSubscriptions
            ? unsubscribe
            : user.isPrivate === '1'
            ? sendSubscriptionRequest
            : subscribe)(user),
        );
      }, [inSubscriptions, dispatch, user]),
      status: useSelector(
        (state) => state.userActionsStatuses.subscribing[user?.username] || initialAsyncState,
      ),
    };
    const togglePinned = {
      onClick: useCallback(() => dispatch(togglePinnedGroup(user?.id)), [dispatch, user]),
      status: useSelector(
        (state) => state.userActionsStatuses.pinned[user?.id] || initialAsyncState,
      ),
    };
    const toggleHidden = {
      onClick: useCallback(() => dispatch(hideByName(user?.username, null, !isHidden)), [
        dispatch,
        isHidden,
        user,
      ]),
      status: useSelector(
        (state) => state.userActionsStatuses.hiding[user?.username] || initialAsyncState,
      ),
    };
    const toggleBanned = {
      onClick: useCallback(() => dispatch((isBanned ? unban : ban)(user)), [
        isBanned,
        dispatch,
        user,
      ]),
      status: useSelector(
        (state) => state.userActionsStatuses.blocking[user?.username] || initialAsyncState,
      ),
    };
    const unsubFromMe = {
      onClick: useCallback(() => dispatch(unsubscribeFromMe(user)), [dispatch, user]),
      status: useSelector(
        (state) =>
          state.userActionsStatuses.unsubscribingFromMe[user?.username] || initialAsyncState,
      ),
    };

    const actionErrors = [toggleSubscribed, togglePinned, toggleHidden, toggleBanned, unsubFromMe]
      .map((a) => a.status.errorText)
      .filter(Boolean);

    if (!user && (isLoggedOut || routeLoadingState || dataStatus.loading || dataStatus.initial)) {
      return (
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <UserPicture large />
          </div>
          <div>
            <Throbber />
          </div>
        </div>
      );
    }

    if (dataStatus.error) {
      return (
        <div className={styles.profile}>
          <div className={styles.avatar}>
            <UserPicture large fallback="+_+" />
          </div>
          <div className="text-danger">
            {isNotFound ? (
              <>
                User <strong>{username}</strong> is not found on {CONFIG.siteTitle}
              </>
            ) : (
              `Cannot load profile: ${dataStatus.errorText}`
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.profile}>
        <div className={styles.avatar}>
          <UserPicture user={user} large />
        </div>
        <div className={styles.info}>
          <div className={styles.screenName}>{user.screenName}</div>
          <div className={styles.username}>
            <span className={styles.infoIcon} style={{ textAlign: 'right' }}>
              @
            </span>
            {user.username}
          </div>
          <div>
            {/* Privacy */}
            <span className={styles.infoStatusSpan}>
              {user.isPrivate === '1' ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faLock} />
                  </span>
                  Private {user.type === 'user' ? 'feed' : 'group'}
                </>
              ) : user.isProtected === '1' ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faUserFriends} />
                  </span>
                  Protected {user.type === 'user' ? 'feed' : 'group'}
                </>
              ) : (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faGlobeAmericas} />
                  </span>
                  Public {user.type === 'user' ? 'feed' : 'group'}
                </>
              )}
            </span>
            <span className={styles.infoStatusSpan}>
              {/* Relationship */}
              {isCurrentUser ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faSmile} />
                  </span>
                  It&#x2019;s you!
                </>
              ) : isBanned ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faBan} />
                  </span>
                  You&#x2019;ve blocked this user
                </>
              ) : inSubscriptions && inSubscribers ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faCheckCircle} />
                  </span>
                  Mutually subscribed
                </>
              ) : isCurrentUserAdmin ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faCheckSquare} />
                  </span>
                  You are an admin
                </>
              ) : inSubscriptions && user.type === 'user' ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faCheckCircle} />
                  </span>
                  You are subscribed
                </>
              ) : inSubscriptions && user.type === 'group' ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faCheckSquare} />
                  </span>
                  You are a member
                </>
              ) : inSubscribers ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faCheckCircleO} />
                  </span>
                  Subscribed to you
                </>
              ) : null}
            </span>
          </div>
        </div>
        <div className={styles.description}>
          <PieceOfText text={user.description} isExpanded={true} showMedia={doShowMedia} />
        </div>
        <div className={styles.stats}>
          <ul className={styles.statsItems}>
            {user.type === 'user' && (
              <StatLink
                value={user.statistics.subscriptions}
                title="subscription"
                linkTo={`/${user.username}/subscriptions`}
                canFollow={canFollowStatLinks}
              />
            )}
            <StatLink
              value={user.statistics.subscribers}
              title="subscriber"
              linkTo={`/${user.username}/subscribers`}
              canFollow={canFollowStatLinks}
            />
            {/* Looks like posts statistics is totally incorrect, so dont show it
            {user.type === 'user' && (
              <StatLink
                value={user.statistics.posts}
                title="post"
                linkTo={`/${user.username}`}
                canFollow={canFollowStatLinks}
              />
            )}
            */}
            {user.type === 'user' && (
              <StatLink
                value={user.statistics.comments}
                title="comment"
                linkTo={`/${user.username}/comments`}
                canFollow={canFollowStatLinks}
              />
            )}
            {user.type === 'user' && (
              <StatLink
                value={user.statistics.likes}
                title="like"
                linkTo={`/${user.username}/likes`}
                canFollow={canFollowStatLinks}
              />
            )}
          </ul>
        </div>
        {currentUser && !isCurrentUser && (
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
                      <ActionLink {...toggleSubscribed}>Unsubscribe</ActionLink>
                    </li>
                  )}
                  {!inSubscriptions && user.isPrivate === '0' && (
                    <li>
                      <ActionLink {...toggleSubscribed}>Subscribe</ActionLink>
                    </li>
                  )}
                  {!inSubscriptions && user.isPrivate === '1' && (
                    <li>
                      {requestSent ? (
                        <>
                          <Icon icon={faClock} /> Request sent
                        </>
                      ) : (
                        <ActionLink {...toggleSubscribed}>Request a subscription</ActionLink>
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
                      <ActionLink {...unsubFromMe}>Unsubscribe from me</ActionLink>
                    </li>
                  )}
                  {user.type === 'group' && inSubscriptions && (
                    <>
                      <li>
                        <Link to={`/filter/direct?invite=${user.username}`}>Invite</Link>
                      </li>
                      <li>
                        <ActionLink
                          {...togglePinned}
                          title={isPinned ? 'Unpin from sidebar' : 'Pin to sidebar'}
                        >
                          {isPinned ? 'Unpin' : 'Pin'}
                        </ActionLink>
                      </li>
                    </>
                  )}
                  <li>
                    <ActionLink {...toggleHidden}>
                      {isHidden ? 'Unhide' : 'Hide'} in Home
                    </ActionLink>
                  </li>
                  {user.type === 'user' && !inSubscriptions && (
                    <li>
                      <ActionLink {...toggleBanned}>Block user</ActionLink>
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>
        )}
        <div className={styles.errorsList}>
          {actionErrors.map((error, i) => (
            <p className="alert alert-danger" role="alert" key={i}>
              {error}
            </p>
          ))}
        </div>
      </div>
    );
  }),
);

function StatLink({ value, title, linkTo, canFollow }) {
  if (value < 0) {
    return null;
  }
  let content = pluralForm(value, title);
  if (canFollow) {
    content = <Link to={linkTo}>{content}</Link>;
  }
  return <li>{content}</li>;
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
