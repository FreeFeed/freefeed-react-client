/* global CONFIG */
import { useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, withRouter } from 'react-router';
import { Portal } from 'react-portal';
import cn from 'classnames';
import {
  faGlobeAmericas,
  faUserFriends,
  faLock,
  faBan,
  faCheckCircle,
  faCheckSquare,
  faUserSlash,
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
  ban,
  unban,
  unsubscribeFromMe,
  listHomeFeeds,
  revokeSentRequest,
} from '../redux/action-creators';
import { withKey } from './with-key';
import { UserPicture } from './user-picture';
import { Throbber } from './throbber';
import { Icon } from './fontawesome-icons';
import PieceOfText from './piece-of-text';
import { ButtonLink } from './button-link';
import { useDropDown, BOTTOM_RIGHT, CLOSE_ON_CLICK_OUTSIDE } from './hooks/drop-down';
import styles from './user-profile-head.module.scss';
import { UserSubscriptionEditPopup } from './user-subscription-edit-popup';
import { HomeFeedLink } from './home-feed-link';

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

    const allHomeFeeds = useSelector((state) => state.homeFeeds);
    const allHomeFeedsStatus = useSelector((state) => state.homeFeedsStatus);
    const inHomeFeeds = useSelector((state) => state.usersInHomeFeeds[user?.id] || []);
    const activeHomeFeeds = allHomeFeeds.filter((h) => inHomeFeeds.includes(h.id));

    const inHomeFeedsStatus = useSelector(
      (state) => state.usersInHomeFeedsStates[user?.username] || initialAsyncState,
    );

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [user, currentUser],
    );

    // Load user data
    useEffect(() => void ((isLoggedOut || dataStatus.initial) && dispatch(getUserInfo(username))), [
      isLoggedOut,
      dataStatus.initial,
      dispatch,
      username,
    ]);
    useEffect(() => void (allHomeFeedsStatus.initial && dispatch(listHomeFeeds())), [
      allHomeFeedsStatus.initial,
      dispatch,
    ]);

    const canFollowStatLinks =
      user && !isBanned && (isCurrentUser || user.isPrivate === '0' || inSubscriptions);

    // Actions & statuses
    const doShowMedia = useCallback((arg) => dispatch(showMedia(arg)), [dispatch]);

    const doUnsubscribe = {
      onClick: useCallback(() => {
        if (!confirm(`Are you sure you want to unsubscribe from @${user.username}?`)) {
          return;
        }
        dispatch(unsubscribe(user));
      }, [dispatch, user]),
      status: useSelector(
        (state) => state.userActionsStatuses.subscribing[user?.username] || initialAsyncState,
      ),
    };
    const doRevokeRequest = {
      onClick: useCallback(() => {
        if (!confirm(`Are you sure you want to revoke this request?`)) {
          return;
        }
        dispatch(revokeSentRequest(user));
      }, [dispatch, user]),
      status: useSelector(
        (state) => state.userActionsStatuses.subscribing[user?.username] || initialAsyncState,
      ),
    };
    const togglePinned = {
      onClick: useCallback(() => dispatch(togglePinnedGroup(user?.id)), [dispatch, user?.id]),
      status: useSelector(
        (state) => state.userActionsStatuses.pinned[user?.id] || initialAsyncState,
      ),
    };
    const toggleHidden = {
      onClick: useCallback(() => dispatch(hideByName(user?.username, null, !isHidden)), [
        dispatch,
        isHidden,
        user?.username,
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

    const actionErrors = [
      doUnsubscribe,
      doRevokeRequest,
      togglePinned,
      toggleHidden,
      toggleBanned,
      unsubFromMe,
    ]
      .map((a) => a.status.errorText)
      .filter(Boolean);

    const {
      pivotRef: subscrFormPivotRef,
      menuRef: subscrFormRef,
      opened: subscrFormOpened,
      toggle: subscrFormToggle,
    } = useDropDown({
      position: BOTTOM_RIGHT,
      closeOn: CLOSE_ON_CLICK_OUTSIDE,
    });

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
              {user.isGone ? (
                <>
                  <span className={styles.infoIcon}>
                    <Icon icon={faUserSlash} />
                  </span>
                  Deleted {user.type}
                </>
              ) : user.isPrivate === '1' ? (
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
        {currentUser && !isCurrentUser && (
          <>
            {inSubscriptions && (
              <div className={styles.lists}>
                {!inHomeFeedsStatus.success ? (
                  'Loading lists...'
                ) : (
                  <>
                    {activeHomeFeeds.length === 0 ? (
                      'In no lists'
                    ) : (
                      <>
                        {activeHomeFeeds.length === 1 ? 'In list:' : 'In lists:'}{' '}
                        {activeHomeFeeds.map((h, i) => (
                          <span key={h.id}>
                            {i > 0 && ', '}
                            <HomeFeedLink feed={h} />
                          </span>
                        ))}
                      </>
                    )}{' '}
                    (
                    <ButtonLink ref={subscrFormPivotRef} onClick={subscrFormToggle}>
                      edit
                    </ButtonLink>
                    )
                  </>
                )}
              </div>
            )}
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
                        <ActionLink {...toggleHidden}>
                          {isHidden ? 'Unhide' : 'Hide'} in Home
                        </ActionLink>
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
            <div className={styles.errorsList}>
              {actionErrors.map((error, i) => (
                <p className="alert alert-danger" role="alert" key={i}>
                  {error}
                </p>
              ))}
            </div>
          </>
        )}
        <div className={styles.stats}>
          {!user.isGone && user.statistics && (
            <ul className={styles.statsItems}>
              {user.type === 'user' && (
                <StatLink
                  value={parseInt(user.statistics.subscriptions)}
                  title="subscription"
                  linkTo={`/${user.username}/subscriptions`}
                  canFollow={canFollowStatLinks}
                />
              )}
              <StatLink
                value={parseInt(user.statistics.subscribers)}
                title="subscriber"
                linkTo={`/${user.username}/subscribers`}
                canFollow={canFollowStatLinks}
              />

              {user.type === 'user' && (
                <>
                  <StatLink
                    title="All posts"
                    linkTo={`/search?qs=${encodeURIComponent(`from:${user.username}`)}`}
                    canFollow={canFollowStatLinks}
                    className={styles.allPosts}
                  />
                  <StatLink
                    value={parseInt(user.statistics.comments)}
                    title="comment"
                    linkTo={`/${user.username}/comments`}
                    canFollow={canFollowStatLinks}
                  />
                  <StatLink
                    value={parseInt(user.statistics.likes)}
                    title="like"
                    linkTo={`/${user.username}/likes`}
                    canFollow={canFollowStatLinks}
                  />
                </>
              )}
            </ul>
          )}
        </div>
        {subscrFormOpened && (
          <Portal>
            <UserSubscriptionEditPopup
              ref={subscrFormRef}
              username={username}
              homeFeeds={allHomeFeeds}
              inHomeFeeds={inHomeFeeds}
              closeForm={subscrFormToggle}
              subscribe={!inSubscriptions}
            />
          </Portal>
        )}
      </div>
    );
  }),
);

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
