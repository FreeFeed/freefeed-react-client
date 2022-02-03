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
import { faSmile, faCheckCircle as faCheckCircleO } from '@fortawesome/free-regular-svg-icons';

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
import { UserProfileHeadActions } from './user-profile-head-actions';

const UserStats = ({ user, canFollowStatLinks }) => {
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
    useEffect(
      () => void ((isLoggedOut || dataStatus.initial) && dispatch(getUserInfo(username))),
      [isLoggedOut, dataStatus.initial, dispatch, username],
    );
    useEffect(
      () => void (allHomeFeedsStatus.initial && dispatch(listHomeFeeds())),
      [allHomeFeedsStatus.initial, dispatch],
    );

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
      onClick: useCallback(
        () => dispatch(hideByName(user?.username, null, !isHidden)),
        [dispatch, isHidden, user?.username],
      ),
      status: useSelector(
        (state) => state.userActionsStatuses.hiding[user?.username] || initialAsyncState,
      ),
    };
    const toggleBanned = {
      onClick: useCallback(
        () => dispatch((isBanned ? unban : ban)(user)),
        [isBanned, dispatch, user],
      ),
      status: useSelector(
        (state) => state.userActionsStatuses.blocking[user?.username] || initialAsyncState,
      ),
    };
    const unsubFromMe = {
      onClick: useCallback(
        () =>
          confirm(`Are you sure you want to unsubscribe @${user.username} from you?`) &&
          dispatch(unsubscribeFromMe(user)),
        [dispatch, user],
      ),
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
        <div className={styles.profile} role="region">
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
        <div className={styles.profile} role="region">
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

    const isAuthenticated = !!currentUser;

    return (
      <div className={styles.profile} role="region">
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
            <PrivacyIndicator user={user} />
            <RelationshipIndicator
              user={user}
              isCurrentUser={isCurrentUser}
              isBanned={isBanned}
              inSubscriptions={inSubscriptions}
              inSubscribers={inSubscribers}
              isCurrentUserAdmin={isCurrentUserAdmin}
            />
          </div>
        </div>
        <div className={styles.description}>
          <PieceOfText text={user.description} isExpanded={true} showMedia={doShowMedia} />
        </div>
        {isAuthenticated && !isCurrentUser && (
          <>
            {inSubscriptions && (
              <InListsIndicator
                inHomeFeedsStatus={inHomeFeedsStatus}
                activeHomeFeeds={activeHomeFeeds}
                subscrFormPivotRef={subscrFormPivotRef}
                subscrFormToggle={subscrFormToggle}
              />
            )}
            <UserProfileHeadActions
              user={user}
              currentUser={currentUser}
              isBanned={isBanned}
              toggleBanned={toggleBanned}
              inSubscriptions={inSubscriptions}
              isCurrentUserAdmin={isCurrentUserAdmin}
              doUnsubscribe={doUnsubscribe}
              subscrFormPivotRef={subscrFormPivotRef}
              subscrFormToggle={subscrFormToggle}
              requestSent={requestSent}
              doRevokeRequest={doRevokeRequest}
              acceptsDirects={acceptsDirects}
              inSubscribers={inSubscribers}
              unsubFromMe={unsubFromMe}
              togglePinned={togglePinned}
              isPinned={isPinned}
              toggleHidden={toggleHidden}
              isHidden={isHidden}
            />
            <div className={styles.errorsList}>
              {actionErrors.map((error, i) => (
                <p className="alert alert-danger" role="alert" key={i}>
                  {error}
                </p>
              ))}
            </div>
          </>
        )}

        <UserStats user={user} canFollowStatLinks={canFollowStatLinks} />

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

function PrivacyIndicator({ user }) {
  const userOrGroup = user.type === 'user' ? 'feed' : 'group';

  let icon = faGlobeAmericas;
  let label = `Public ${userOrGroup}`;

  if (user.isGone) {
    icon = faUserSlash;
    label = 'Deleted user';
  } else if (user.isPrivate === '1') {
    icon = faLock;
    label = `Private ${userOrGroup}`;
  } else if (user.isProtected === '1') {
    icon = faUserFriends;
    label = `Protected ${userOrGroup}`;
  }

  return (
    <span className={styles.infoStatusSpan}>
      <span className={styles.infoIcon}>
        <Icon icon={icon} />
      </span>
      {label}
    </span>
  );
}

function InListsIndicator({
  inHomeFeedsStatus,
  activeHomeFeeds,
  subscrFormPivotRef,
  subscrFormToggle,
}) {
  if (!inHomeFeedsStatus.success) {
    return <div className={styles.lists}>Loading lists...</div>;
  }
  return (
    <div className={styles.lists}>
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
      <ButtonLink ref={subscrFormPivotRef} onClick={subscrFormToggle}>
        edit
      </ButtonLink>
    </div>
  );
}

function RelationshipIndicator({
  user,
  isCurrentUser,
  isBanned,
  inSubscriptions,
  inSubscribers,
  isCurrentUserAdmin,
}) {
  let icon;
  let label;

  if (isCurrentUser) {
    icon = faSmile;
    label = 'It’s you!';
  } else if (isBanned) {
    icon = faBan;
    label = 'You’ve blocked this user';
  } else if (inSubscriptions && inSubscribers) {
    icon = faCheckCircle;
    label = 'Mutually subscribed';
  } else if (isCurrentUserAdmin) {
    icon = faCheckSquare;
    label = 'You are an admin';
  } else if (inSubscriptions) {
    icon = faCheckCircle;
    label = `You are ${user.type === 'user' ? 'subscribed' : 'a member'}`;
  } else if (inSubscribers) {
    icon = faCheckCircleO;
    label = 'Subscribed to you';
  } else {
    return null;
  }

  return (
    <span className={styles.infoStatusSpan}>
      <span className={styles.infoIcon}>
        <Icon icon={icon} />
      </span>
      {label}
    </span>
  );
}

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
