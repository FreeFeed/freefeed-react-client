/* global CONFIG */
import { createRoot } from 'react-dom/client';
import { Suspense, useEffect, useLayoutEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import * as Sentry from '@sentry/react';
import 'focus-visible';

import 'autotrack'; // used by google-analytics in ../index.jade

import '../styles/common/common.scss';
import '../styles/helvetica/app.scss';
import '../styles/helvetica/dark-theme.scss';
import './components/docs/documents.scss';

import { createBrowserHistory } from 'history';
import configureStore from './redux/configure-store';
import * as ActionCreators from './redux/action-creators';

// Statically linked pages
import Layout from './components/layout';
import Home from './components/home';
import Discussions from './components/discussions';
import SinglePost from './components/single-post';
import User from './components/user';
import SearchFeed from './components/search-feed';
import PlainFeed from './components/plain-feed';
import { settingsRoute } from './components/settings/routes';
import { CALENDAR_START_YEAR } from './utils/calendar-utils';

const lazyLoad = (loader, importName = 'default') =>
  lazyRetry(() => loader().then((m) => ({ default: m[importName] })));

// Dynamically linked pages
const CalendarYear = lazyLoad(() => import('./components/calendar/calendar-year'));
const CalendarMonth = lazyLoad(() => import('./components/calendar/calendar-month'));
const CalendarDate = lazyLoad(() => import('./components/calendar/calendar-date'));
const SignupByInvitation = lazyLoad(() => import('./components/signup-by-invitation'));
const BookmarkletComponent = lazyLoad(() => import('./components/bookmarklet'));
const ManageSubscribers = lazyLoad(() => import('./components/manage-subscribers'));
const Subscribers = lazyLoad(() => import('./components/subscribers'));
const Subscriptions = lazyLoad(() => import('./components/subscriptions'));
const Summary = lazyLoad(() => import('./components/summary'));
const Groups = lazyLoad(() => import('./components/groups'));
const BacklinksFeed = lazyLoad(() => import('./components/backlinks-feed'));
const UserMedia = lazyLoad(() => import('./components/user-media'));
const DocumentsPage = lazyLoad(() => import('./components/docs/DocumentsPage'));
const PublicDocumentView = lazyLoad(() => import('./components/docs/PublicDocumentView'));

Sentry.init({
  dsn: CONFIG.sentry.publicDSN,
  integrations: (integrations) => integrations.filter((i) => i.name !== 'BrowserSession'),
});

const history = createBrowserHistory();

{
  let lastLocationKey = null;
  // Scroll to top on navigation events
  history.listen((e) => {
    // If location key is the same, then we returned back from the lightbox. The
    // lightbox uses native pushState/back to close itself by the Back button. In
    // this case we should not scroll to the top.
    const locationKey = e.location.key;
    if (locationKey !== lastLocationKey) {
      safeScrollTo(0, 0);
      lastLocationKey = locationKey;
    }
  });

  // Initialize history API (assign some key to the current location)
  const loc = history.location;
  history.replace({
    pathname: loc.pathname,
    search: loc.search,
    hash: loc.hash,
  });
}

const store = configureStore(undefined, { history });

import { bindRouteActions } from './redux/route-actions';
import { initUnscroll, safeScrollTo } from './services/unscroll';
import { lazyRetry } from './utils/retry-promise';
import { HomeAux } from './components/home-aux';
import { NotFound } from './components/not-found';
import { DialogProvider } from './components/dialog/context';
import { ColorSchemeSetter } from './components/color-theme-setter';
import { Route, Router, Switch, useNouter, useResolvedRoutes } from './services/nouter';

const boundRouteActions = bindRouteActions(store.dispatch);

const thisYear = new Date().getFullYear();

const manageSubscribersActions = (next) => {
  const { userName } = next.params;
  store.dispatch(ActionCreators.getUserInfo(userName));
  store.dispatch(ActionCreators.subscribers(userName));
};

const inviteActions = () => {
  const { username } = store.getState().user;
  store.dispatch(ActionCreators.subscriptions(username));
  store.dispatch(ActionCreators.getInvitationsInfo());
};

// needed to display mutual friends
const subscribersSubscriptionsActions = (next) => {
  const { userName } = next.params;

  if (userName === store.getState().user.username) {
    return;
  }

  store.dispatch(ActionCreators.subscribers(userName));
  store.dispatch(ActionCreators.subscriptions(userName));
};

const enterStaticPage = (title) => () => {
  store.dispatch(ActionCreators.staticPage(title));
};

const generateRouteHooks = (callback) => ({
  onEnter: callback,
  onChange: (_, next) => callback(next),
});

function InitialLayout({ children }) {
  useEffect(() => {
    document.body.classList.add('initial');
    return () => document.body.classList.remove('initial');
  }, []);

  return (
    <div className="startup">
      <ColorSchemeSetter />
      <h1 className="startup__logo-box">
        <a href="/" className="startup__logo-link">
          {CONFIG.siteTitle}
        </a>
      </h1>
      <div className="initial-layout__content">{children}</div>
    </div>
  );
}

function Bookmarklet(props) {
  return (
    <Suspense fallback="Loading bookmarklet">
      <BookmarkletComponent {...props} />
    </Suspense>
  );
}

initUnscroll();

// Fetch server info on application start
setTimeout(() => store.dispatch(ActionCreators.getServerInfo()), 0);

function App() {
  const initialized = useSelector((state) => state.initialized);
  if (initialized.initial || initialized.loading) {
    return (
      <InitialLayout>
        <p>Loading...</p>
      </InitialLayout>
    );
  }

  if (initialized.error) {
    return (
      <InitialLayout>
        <div className="alert alert-danger" role="alert">
          <p>Cannot load page: {initialized.errorText}</p>
          <p>Try to reload this page later.</p>
        </div>
      </InitialLayout>
    );
  }

  return (
    <Router history={history}>
      <SyncRoutesWithStore />
      <Switch>
        <Route name="bookmarklet" path="/bookmarklet" component={Bookmarklet} />

        <Route path="/" name="root" nest>
          <Layout>
            <Switch>
              <Route
                path="/"
                name="home"
                component={Home}
                {...generateRouteHooks(boundRouteActions('home'))}
              />
              <Route path="/list/:listId/:listTitle?" name="homeAux" component={HomeAux} />
              <Route path="about" nest>
                <Switch>
                  <Route
                    path="/"
                    name="about"
                    component={lazyLoad(() => import('./components/about'))}
                    onEnter={enterStaticPage('About')}
                  />
                  <Route path="terms" component={externalRedirect('/docs/terms')} />
                  <Route path="privacy" component={externalRedirect('/docs/privacy')} />
                  <Route
                    path="stats"
                    component={lazyLoad(() => import('./components/stats'))}
                    onEnter={enterStaticPage('Stats')}
                  />
                  <Route
                    path="donate"
                    component={lazyLoad(() => import('./components/donate'))}
                    onEnter={enterStaticPage('Donate')}
                  />
                </Switch>
              </Route>
              <Route path="dev">
                <Redirect to="/ffdev" replace />
              </Route>
              <Route
                path="signin"
                component={lazyLoad(() => import('./components/signin'))}
                onEnter={enterStaticPage('Sign in')}
              />
              <Route
                path="signup"
                component={lazyLoad(() => import('./components/signup'))}
                onEnter={enterStaticPage('Sign up')}
              />
              <Route
                path="restore"
                component={lazyLoad(() => import('./components/restore-password'))}
              />
              <Route
                path="reset"
                component={lazyLoad(() => import('./components/reset-password'))}
              />
              {settingsRoute('settings')}
              <Route
                path="settings/archive"
                component={lazyLoad(() => import('./components/archive'))}
                onEnter={enterStaticPage('Restore from FriendFeed.com Archives')}
              />
              <Route
                name="groupSettings"
                path="/:userName/settings"
                component={lazyLoad(() => import('./components/group-settings'))}
                {...generateRouteHooks(boundRouteActions('getUserInfo'))}
              />
              <Route
                name="discussions"
                path="filter/discussions"
                component={Discussions}
                {...generateRouteHooks(boundRouteActions('discussions'))}
              />
              <Route
                name="saves"
                path="filter/saves"
                component={Discussions}
                {...generateRouteHooks(boundRouteActions('saves'))}
              />
              <Route
                name="summary"
                path="/summary/:days?"
                component={Summary}
                {...generateRouteHooks(boundRouteActions('summary'))}
              />
              <Route
                name="direct"
                path="filter/direct"
                component={Discussions}
                {...generateRouteHooks(boundRouteActions('direct'))}
              />
              <Route
                name="search"
                path="search"
                component={SearchFeed}
                {...generateRouteHooks(boundRouteActions('search'))}
              />
              <Route
                name="notifications"
                path="filter/notifications"
                component={lazyLoad(() => import('./components/notifications'))}
                {...generateRouteHooks(boundRouteActions('notifications'))}
              />
              <Route
                name="drafts"
                path="filter/drafts"
                component={lazyLoad(() => import('./components/drafts-page'))}
              />
              <Route
                name="best_of"
                path="filter/best_of"
                component={PlainFeed}
                {...generateRouteHooks(boundRouteActions('best_of'))}
              />
              <Route
                name="everything"
                path="filter/everything"
                component={PlainFeed}
                {...generateRouteHooks(boundRouteActions('everything'))}
              />
              <Route
                name="groups"
                path="/groups"
                component={Groups}
                onEnter={enterStaticPage('Groups')}
              />
              <Route
                name="all-groups"
                path="/all-groups"
                component={lazyLoad(() => import('./components/all-groups'))}
              />
              <Route
                name="friends"
                path="/friends"
                component={lazyLoad(() => import('./components/friends-page'), 'Friends')}
              />
              <Route
                name="groupCreate"
                path="/groups/create"
                component={lazyLoad(() => import('./components/group-create'))}
                onEnter={enterStaticPage('Create a group')}
              />
              <Route
                name="archivePost"
                path="/archivePost"
                component={lazyLoad(() => import('./components/archive-post'))}
                {...generateRouteHooks(boundRouteActions('archivePost'))}
              />
              <Route
                name="documents"
                path="/documents"
                component={DocumentsPage}
              />
              <Route
                name="createInvitation"
                path="/invite"
                component={lazyLoad(() => import('./components/invitation-creation-form'))}
                onEnter={inviteActions}
              />
              <Route
                name="signupByInvitation"
                path="/invited/:invitationId"
                component={SignupByInvitation}
              />
              <Route
                name="userFeed"
                path="/:userName"
                component={checkPath(User, isAccountPath)}
                {...generateRouteHooks(boundRouteActions('userFeed'))}
              />
              <Route
                name="memories"
                path="/memories/:from"
                component={checkPath(PlainFeed, isMemoriesPath)}
                {...generateRouteHooks(boundRouteActions('memories'))}
              />
              <Route
                name="userMemories"
                path="/:userName/memories/:from"
                component={checkPath(PlainFeed, isMemoriesPath)}
                {...generateRouteHooks(boundRouteActions('userMemories'))}
              />

              <Route path="/:userName/calendar">
                <CalendarRedirect thisYear={thisYear} />
              </Route>
              <Route
                name="userCalendarYear"
                path="/:userName/calendar/:year"
                component={checkPath(CalendarYear, isCalendarYearPath)}
                {...generateRouteHooks(boundRouteActions('calendarYear'))}
              />
              <Route
                name="userCalendarMonth"
                path="/:userName/calendar/:year/:month"
                component={checkPath(CalendarMonth, isCalendarMonthPath)}
                {...generateRouteHooks(boundRouteActions('calendarMonth'))}
              />
              <Route
                name="userCalendarDate"
                path="/:userName/calendar/:year/:month/:day"
                component={checkPath(CalendarDate, isCalendarDatePath)}
                {...generateRouteHooks(boundRouteActions('calendarDate'))}
              />

              <Route
                name="userSummary"
                path="/:userName/summary/:days?"
                component={User}
                {...generateRouteHooks(boundRouteActions('userSummary'))}
              />
              <Route
                name="subscribers"
                path="/:userName/subscribers"
                onEnter={subscribersSubscriptionsActions}
              >
                <FriendsPageRedirect>
                  <Subscribers />
                </FriendsPageRedirect>
              </Route>
              <Route
                name="subscriptions"
                path="/:userName/subscriptions"
                onEnter={subscribersSubscriptionsActions}
              >
                <FriendsPageRedirect>
                  <Subscriptions />
                </FriendsPageRedirect>
              </Route>
              <Route
                name="manage-subscribers"
                path="/:userName/manage-subscribers"
                component={ManageSubscribers}
                onEnter={manageSubscribersActions}
              />
              <Route
                name="userComments"
                path="/:userName/comments"
                component={User}
                {...generateRouteHooks(boundRouteActions('userComments'))}
              />
              <Route
                name="userLikes"
                path="/:userName/likes"
                component={User}
                {...generateRouteHooks(boundRouteActions('userLikes'))}
              />
              <Route
                name="userMedia"
                path="/:userName/media"
                component={UserMedia}
                {...generateRouteHooks(boundRouteActions('userMedia'))}
              />
              <Route path="/.well-known/change-password">
                <Redirect to="/settings/sign-in" />
              </Route>
              <Route
                name="post"
                path="/:userName/:postId"
                component={checkPath(SinglePost, isPostPath)}
                {...generateRouteHooks(boundRouteActions('post'))}
              />
              <Route
                name="backlinks"
                path="/:userName/:postId/backlinks"
                component={checkPath(BacklinksFeed, isPostPath)}
                {...generateRouteHooks(boundRouteActions('backlinks'))}
              />
              {/* Public document viewer — placed before 404 to prevent /docs/:slug matching /:userName */}
              <Route name="publicDoc" path="/docs/:username/:slug" component={PublicDocumentView} />
              <Route name="publicDocFlat" path="/docs/:slug" component={PublicDocumentView} />
              <Route name="404" component={NotFound} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </Router>
  );
}

const appRoot = document.querySelector('#app');
appRoot.className = '';
appRoot.innerHTML = '';
createRoot(appRoot).render(
  <Provider store={store}>
    <DialogProvider>
      <App />
    </DialogProvider>
  </Provider>,
);

function Redirect({ to, replace = false }) {
  const { navigate } = useNouter();
  useLayoutEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);
  return null;
}

function CalendarRedirect({ thisYear }) {
  const { params } = useNouter();
  return <Redirect to={`/${encodeURIComponent(params.userName)}/calendar/${thisYear}`} />;
}

// Redirects own Subscriptions and Subscribers page to the Friends page
function FriendsPageRedirect({ children }) {
  const { params, name } = useNouter();
  const myUsername = useSelector((state) => state.user.username);

  if (params.userName === myUsername) {
    return <Redirect to={`/friends?show=${name}`} replace />;
  }

  return children;
}

function SyncRoutesWithStore() {
  const dispatch = useDispatch();
  const routes = useResolvedRoutes();
  useLayoutEffect(
    () => void dispatch(ActionCreators.setResolvedRoutes(routes)),
    [dispatch, routes],
  );
  return null;
}

function checkPath(Component, checker) {
  return (props) => {
    const router = useNouter();
    return checker(router) ? <Component {...props} /> : <NotFound {...props} />;
  };
}

function isPostPath({ params: { postId, userName } }) {
  // The FreeFeed's usernames can have up to 25 characters length now, but some
  // old groups can have up to 27 characters in username
  return (
    /^[a-z\d-]{3,30}$/i.test(userName) &&
    (/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(postId) ||
      /^[a-f\d]{6,10}$/i.test(postId)) // Short post ID
  );
}

function isAccountPath({ params: { userName } }) {
  // The FreeFeed's usernames can have up to 25 characters length now, but some
  // old grops can have up to 27 characters in username
  return /^[a-z\d-]{3,30}$/i.test(userName);
}

function isMemoriesPath({ params: { userName, from } }) {
  const kindaValidDate = /^20\d\d(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])$/i.test(from);
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return kindaValidDate && validUsername;
}

const isValidCalendarYear = (year) => {
  const yearAsInt = parseInt(year, 10);
  return yearAsInt >= CALENDAR_START_YEAR && yearAsInt <= thisYear;
};

const isValidMonth = (month) => {
  const monthAsInt = parseInt(month, 10);
  return monthAsInt >= 1 && monthAsInt <= 12;
};

const isValidDay = (day) => {
  const dayAsInt = parseInt(day, 10);
  return dayAsInt >= 1 && dayAsInt <= 31;
};

function isCalendarYearPath({ params: { userName, year } }) {
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return isValidCalendarYear(year) && validUsername;
}

function isCalendarMonthPath({ params: { userName, year, month } }) {
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return isValidCalendarYear(year) && isValidMonth(month) && validUsername;
}

function isCalendarDatePath({ params: { userName, year, month, day } }) {
  const validUsername = typeof userName === 'undefined' || isAccountPath({ params: { userName } });
  return isValidCalendarYear(year) && isValidMonth(month) && isValidDay(day) && validUsername;
}

function externalRedirect(href) {
  // A functional component that redirects to a given external URL
  return () => {
    window.location.replace(href);
    return null;
  };
}
