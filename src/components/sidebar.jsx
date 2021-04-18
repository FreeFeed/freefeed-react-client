/* global CONFIG */
import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { connect, useDispatch, useSelector } from 'react-redux';
import format from 'date-fns/format';
import cn from 'classnames';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { htmlSafe } from '../utils';
import { listHomeFeeds, openSidebar, setUserColorScheme } from '../redux/action-creators';
import {
  SCHEME_DARK,
  SCHEME_SYSTEM,
  SCHEME_LIGHT,
  systemColorSchemeSupported,
} from '../services/appearance';
import { bookmarkletHref } from '../bookmarklet/loader';
import UserName from './user-name';
import RecentGroups from './recent-groups';
import ErrorBoundary from './error-boundary';
import { InvisibleSelect } from './invisible-select';
import { UserPicture } from './user-picture';
import { SidebarHomeFeeds } from './sidebar-homefeeds';
import { ButtonLink } from './button-link';
import { Throbber } from './throbber';
import { DonationWidget } from './donation-widget';
import { useMediaQuery } from './hooks/media-query';
import { useResizing } from './hooks/resizing';
import { Icon } from './fontawesome-icons';
import { useEventListener } from './hooks/sub-unsub';

function LoggedInBlock({ user, signOut }) {
  const signOutStatus = useSelector((state) => state.signOutStatus);
  return (
    <div className="logged-in" role="region">
      <div className="avatar">
        <UserPicture user={user} />
      </div>

      <div className="user">
        <div className="author">
          <UserName user={user} noUserCard>
            {user.screenName}
          </UserName>
        </div>
        <div>
          <Link to="/settings">settings</Link>
          &nbsp;-&nbsp;
          <ButtonLink onClick={signOut} disabled={signOutStatus.loading}>
            sign out
          </ButtonLink>{' '}
          {signOutStatus.loading && <Throbber />}
        </div>
      </div>
    </div>
  );
}

const SideBarFriends = ({ user }) => {
  const dispatch = useDispatch();
  const homeFeedsCount = useSelector((state) => state.homeFeeds.length);
  const homeFeedsStatus = useSelector((state) => state.homeFeedsStatus);
  useEffect(() => void (homeFeedsStatus.initial && dispatch(listHomeFeeds())), [
    homeFeedsStatus.initial,
    dispatch,
  ]);

  const hasNotifications =
    user.unreadNotificationsNumber > 0 && !user.frontendPreferences.hideUnreadNotifications;
  const hasUnreadDirects = user.unreadDirectsNumber > 0;

  const directsStyle = hasUnreadDirects ? { fontWeight: 'bold' } : {};
  const notificationsStyle = hasNotifications ? { fontWeight: 'bold' } : {};
  const directsCountBadge = hasUnreadDirects ? `(${user.unreadDirectsNumber})` : '';
  const notificationsCountBadge = hasNotifications ? `(${user.unreadNotificationsNumber})` : '';

  return (
    <>
      <div className="box" role="navigation">
        <div className="box-header-friends" role="heading">
          My
        </div>
        <div className="box-body">
          <ul>
            <li className="p-home">
              <Link to="/">Home</Link>
            </li>

            <li className="p-direct-messages">
              <Link to="/filter/direct" style={directsStyle}>
                Direct messages {directsCountBadge}
              </Link>
            </li>
            <li className="p-my-discussions">
              <Link to="/filter/discussions">Discussions</Link>
            </li>
            <li className="p-saved-posts">
              <Link to="/filter/saves">Saved posts</Link>
            </li>
            <li className="p-best-of">
              <Link to="/summary/1">Best of the day</Link>
            </li>
            <li className="p-home">
              <Link to="/filter/notifications" style={notificationsStyle}>
                Notifications {notificationsCountBadge}
              </Link>
            </li>
          </ul>
        </div>

        {do {
          if (homeFeedsCount === 1) {
            <div className="box-footer">
              <Link to={`/friends`}>Browse/edit friends and lists</Link>
            </div>;
          }
        }}
      </div>

      {do {
        if (homeFeedsCount > 1) {
          <div className="box" role="navigation">
            <div className="box-header-friends" role="heading">
              Friend lists
            </div>

            <div className="box-body">
              <SidebarHomeFeeds homeFeedsCount={homeFeedsCount} />
            </div>

            <div className="box-footer">
              <Link to={`/friends`}>Browse/edit friends and lists</Link>
            </div>
          </div>;
        }
      }}
    </>
  );
};

const SideBarFreeFeed = () => (
  <div className="box" role="navigation">
    <div className="box-header-freefeed" role="heading">
      {CONFIG.siteTitle}
    </div>
    <div className="box-body">
      <ul>
        <li>
          <Link to="/search">Search</Link>
        </li>
        <li className="p-invites">
          <Link to="/invite">Invite</Link>
        </li>
        <li>
          <Link to="/filter/everything">Everything</Link>
        </li>
        <li>
          <Link to="/all-groups">Public groups</Link>
        </li>
        <li>
          <Link to="/support">Support</Link> /{' '}
          <a href="https://github.com/FreeFeed/freefeed-server/wiki/FAQ" target="_blank">
            FAQ
          </a>
        </li>
        <li>
          <Link to="/freefeed">News</Link>
        </li>
        <li>
          <Link to="/about/donate">Donate</Link>
        </li>
      </ul>
    </div>
  </div>
);

const SideBarMemories = () => {
  const today = new Date();
  const todayString = format(today, 'MMdd');
  const todayYear = today.getFullYear();
  const yearLinks = [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
  ].map((years, index) => (
    <div className="years-row" key={index}>
      {years.map((offset) => {
        const linkYear = todayYear - offset;
        return (
          <Link key={`link-${offset}`} to={`/memories/${linkYear}${todayString}`}>
            {linkYear}
          </Link>
        );
      })}
    </div>
  ));
  return (
    <div className="box" role="navigation">
      <div className="box-header-memories" role="heading">
        Memories of {format(today, 'MMMM\u00A0d')}
      </div>
      <div className="box-body">
        <div className="year-links-row">{yearLinks}</div>
      </div>
    </div>
  );
};

const SideBarGroups = () => {
  return (
    <div className="box" role="navigation">
      <div className="box-header-groups" role="heading">
        Groups
      </div>
      <div className="box-body">
        <RecentGroups />
      </div>
      <div className="box-footer">
        <Link to="/groups">Browse/edit groups</Link>
      </div>
    </div>
  );
};

const SideBarBookmarklet = () => (
  <div className="box" role="region">
    <div className="box-header-groups" role="heading">
      Bookmarklet
    </div>
    <div className="box-footer">
      Once added to your toolbar, this button will let you share web pages on {CONFIG.siteTitle}.
      You can even attach thumbnails of images from the page you share!
    </div>
    <div className="box-footer">
      Click and drag{' '}
      <span
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `<a class="bookmarklet-button" href="${htmlSafe(
            bookmarkletHref(),
          )}" onclick="return false">Share on ${CONFIG.siteTitle}</a>`,
        }}
      />{' '}
      to&nbsp;your toolbar.
    </div>
    <div className="box-footer">
      There is also a{' '}
      <a href="https://chrome.google.com/webstore/detail/share-on-freefeed/dngijpbccpnbjlpjomjmlppfgmnnilah">
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Chrome Extension</span>
      </a>{' '}
      for sharing on {CONFIG.siteTitle}.
    </div>
  </div>
);

const SideBarArchive = ({ user }) => {
  if (!user || !user.privateMeta) {
    return null;
  }
  const { archives } = user.privateMeta;
  if (
    !user ||
    !user.privateMeta ||
    !archives ||
    (archives.recovery_status === 2 && archives.restore_comments_and_likes)
  ) {
    return null;
  }
  return (
    <div className="box" role="navigation">
      <div className="box-header-groups" role="heading">
        FriendFeed.com Archives
      </div>
      <div className="box-body">
        <ul>
          <li>
            <Link to="/settings/archive">Restore your archive!</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

const SideBarAppearance = connect(
  ({ userColorScheme }) => ({ userColorScheme }),
  (dispatch) => ({ onChange: (e) => dispatch(setUserColorScheme(e.target.value)) }),
)(({ userColorScheme, onChange }) => {
  let value = userColorScheme;
  if (!systemColorSchemeSupported && value === SCHEME_SYSTEM) {
    value = SCHEME_LIGHT;
  }
  return (
    <div className="box" role="region">
      <div className="box-header-groups" role="heading">
        Appearance
      </div>
      <div className="box-body">
        <ul>
          <li>
            <div>
              Color Scheme:{' '}
              <InvisibleSelect value={value} onChange={onChange} className="color-scheme-selector">
                <option value={SCHEME_LIGHT}>Light</option>
                {systemColorSchemeSupported && <option value={SCHEME_SYSTEM}>Auto</option>}
                <option value={SCHEME_DARK}>Dark</option>
              </InvisibleSelect>{' '}
              <span className="color-scheme-hint">
                {value === SCHEME_LIGHT
                  ? 'default'
                  : value === SCHEME_SYSTEM
                  ? 'as in your OS'
                  : null}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
});

export default function SideBar({ user, signOut }) {
  const dispatch = useDispatch();
  const sidebarOpened = useSelector((state) => state.sidebarOpened);

  // Sidebar is 'closed' (actually it is always visible) on the wide screens
  const wideScreen = useMediaQuery('(min-width: 992px)');
  useEffect(() => void (wideScreen && dispatch(openSidebar(false))), [wideScreen, dispatch]);

  // Turn off body scrolling while the sidebar is opened
  useEffect(() => void document.body.classList.toggle('body--no-scroll', sidebarOpened), [
    sidebarOpened,
  ]);

  // Reset content's scrollTop when the sidebar opening
  const content = useRef(null);
  useEffect(() => void (sidebarOpened && (content.current.scrollTop = 0)), [sidebarOpened]);

  const clickToCLose = useCallback(
    (e) => {
      if (
        // Click on shadow
        e.target === e.currentTarget ||
        // Click on links
        e.target.closest('a') !== null
      ) {
        dispatch(openSidebar(false));
      }
    },
    [dispatch],
  );

  const resizing = useResizing();
  const doCloseSidebar = useCallback(() => dispatch(openSidebar(false)), [dispatch]);

  useSwipe(
    useCallback(
      (direction) => {
        direction === LEFT && !sidebarOpened && dispatch(openSidebar(true));
        direction === RIGHT && sidebarOpened && dispatch(openSidebar(false));
      },
      [sidebarOpened, dispatch],
    ),
  );

  return (
    <div
      className={cn(
        'col-md-3 sidebar',
        resizing && 'sidebar--no-transitions',
        sidebarOpened && 'sidebar--opened',
      )}
      role="complementary"
      onClick={clickToCLose}
    >
      <div className="sidebar__content" ref={content}>
        <ErrorBoundary>
          <button className="sidebar__close-button" onClick={doCloseSidebar}>
            <Icon icon={faTimes} />
          </button>

          <LoggedInBlock user={user} signOut={signOut} />
          <SideBarFriends user={user} />
          <SideBarGroups />
          <SideBarArchive user={user} />
          <SideBarFreeFeed />
          <SideBarBookmarklet />
          <SideBarMemories />
          <DonationWidget />
          <SideBarAppearance />
        </ErrorBoundary>
      </div>
    </div>
  );
}

const LEFT = 'LEFT';
const RIGHT = 'RIGHT';

function touchInfo(event) {
  return {
    x: event.changedTouches[0].pageX,
    y: event.changedTouches[0].pageY,
    time: new Date().getTime(),
  };
}

function useSwipe(onSwipe, { maxDuration = 2000, minXShift = 30 } = {}) {
  const win = useRef(window);
  const start = useRef({ x: 0, y: 0, time: 0 });
  const scroll = useRef(false);

  useEventListener(
    win,
    'touchstart',
    useCallback((e) => {
      // Do not show sidebar if the touch stars on draggable/swipeable items
      if (
        e.target.closest('.pswp') ||
        e.target.closest('.sortable-images') ||
        e.target.closest('.draggable')
      ) {
        return;
      }

      scroll.current = false;
      start.current = touchInfo(e);
    }, []),
  );

  useEventListener(
    win,
    'scroll',
    useCallback(() => (scroll.current = true), []),
    true, // useCapture
  );

  useEventListener(
    win,
    'touchend',
    useCallback(
      (e) => {
        const t1 = start.current;
        const t2 = touchInfo(e);
        if (
          scroll.current ||
          t2.time - t1.time > maxDuration ||
          Math.abs(t2.x - t1.x) < minXShift
        ) {
          return;
        }

        onSwipe(t2.x > t1.x ? RIGHT : LEFT);
      },
      [maxDuration, minXShift, onSwipe],
    ),
  );
}
