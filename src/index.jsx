import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import Loadable from 'react-loadable';

import 'autotrack';  // used by google-analytics in ../index.jade

import '../styles/common/common.scss';
import '../styles/helvetica/app.scss';
import '../styles/helvetica/dark-theme.scss';

import configureStore from './redux/configure-store';
import * as ActionCreators from './redux/action-creators';

import Layout from './components/layout';
import Home from './components/home';
import Discussions from './components/discussions';
import Summary from './components/summary';
import SinglePost from './components/single-post';
import User from './components/user';
import Subscribers from './components/subscribers';
import Subscriptions from './components/subscriptions';
import Groups from './components/groups';
import SearchFeed from './components/search-feed';
import PlainFeed from './components/plain-feed';
import Friends from './components/friends';
import ManageSubscribers from './components/manage-subscribers';
import Bookmarklet from './components/bookmarklet';
import SignupByInvitation from './components/signup-by-invitation';


const store = configureStore();

//request main info for user
if (store.getState().authenticated) {
  let delay = 0;

  // Defer the whoami request to let the feed load first, if we have a cached copy of whoami already
  if (store.getState().user.screenName) {
    delay = 200;
  }

  setTimeout(() => {
    store.dispatch(ActionCreators.whoAmI());
  }, delay);
} else {
  // just commented for develop sign up form
  store.dispatch(ActionCreators.unauthenticated());
}

import { bindRouteActions } from './redux/route-actions';

// Set initial history state.
// Without this, there can be problems with third-party
// modules using history API (specifically, PhotoSwipe).
browserHistory.replace({
  pathname: location.pathname,
  search:   location.search,
  hash:     location.hash,
});

const boundRouteActions = bindRouteActions(store.dispatch);

const history = syncHistoryWithStore(browserHistory, store);

const manageSubscribersActions = (next) => {
  const { userName } = next.params;
  store.dispatch(ActionCreators.getUserInfo(userName));
  store.dispatch(ActionCreators.subscribers(userName));
};

const friendsActions = () => {
  const { username } = store.getState().user;
  store.dispatch(ActionCreators.subscribers(username));
  store.dispatch(ActionCreators.subscriptions(username));
  store.dispatch(ActionCreators.blockedByMe(username));
};

const inviteActions = () => {
  const { username } = store.getState().user;
  store.dispatch(ActionCreators.subscriptions(username));
};

// needed to display mutual friends
const subscribersSubscriptionsActions = (next) => {
  const { userName } = next.params;
  store.dispatch(ActionCreators.subscribers(userName));
  store.dispatch(ActionCreators.subscriptions(userName));
};

const enterStaticPage = (title) => () => {
  store.dispatch(ActionCreators.staticPage(title));
};

history.listen(() => scrollTo(0, 0));

const generateRouteHooks = (callback) => ({
  onEnter:  callback,
  onChange: (_, next) => callback(next),
});

const lazyLoad = (path) => Loadable({
  loading: ({ error }) => {
    if (error) {
      return <div>Cannot load page</div>;
    }
    return <div>Loading page...</div>;
  },
  // For some reason, the import() argument must have an explicit string type.
  // See https://github.com/webpack/webpack/issues/4921#issuecomment-357147299
  loader: () => import(`${path}`),
});


ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route name="bookmarklet" path="/bookmarklet" component={Bookmarklet} />

      <Route path="/" component={Layout}>
        <IndexRoute name="home" component={Home} {...generateRouteHooks(boundRouteActions('home'))} />
        <Route path="about">
          <IndexRoute name="about" component={lazyLoad('./components/about')} onEnter={enterStaticPage('About')} />
          <Route path="terms" component={lazyLoad('./components/terms')} onEnter={enterStaticPage('Terms')} />
          <Route path="privacy" component={lazyLoad('./components/privacy')} onEnter={enterStaticPage('Privacy')} />
          <Route path="stats" component={lazyLoad('./components/stats')} onEnter={enterStaticPage('Stats')} />
          <Route path="donate" component={lazyLoad('./components/donate')} onEnter={enterStaticPage('Donate')} />
        </Route>
        <Route path="dev" component={lazyLoad('./components/dev')} onEnter={enterStaticPage('Developers')} />
        <Route path="signin" component={lazyLoad('./components/signin')} onEnter={enterStaticPage('Sign in')} />
        <Route path="signup" component={lazyLoad('./components/signup')} onEnter={enterStaticPage('Sign up')} />
        <Route path="restore" component={lazyLoad('./components/restore-password')} />
        <Route path="reset" component={lazyLoad('./components/reset-password')} />
        <Route path="settings" component={lazyLoad('./components/settings')} onEnter={enterStaticPage('Settings')} />
        <Route path="settings/archive" component={lazyLoad('./components/archive')} onEnter={enterStaticPage('Restore from FriendFeed.com Archives')} />
        <Route path="settings/app-tokens(/**)" component={lazyLoad('./components/app-tokens')} />
        <Route name="groupSettings" path="/:userName/settings" component={lazyLoad('./components/group-settings')} {...generateRouteHooks(boundRouteActions('getUserInfo'))} />
        <Route name="discussions" path="filter/discussions" component={Discussions} {...generateRouteHooks(boundRouteActions('discussions'))} />
        <Route name="saves" path="filter/saves" component={Discussions} {...generateRouteHooks(boundRouteActions('saves'))} />
        <Route name="summary" path="/summary(/:days)" component={Summary} {...generateRouteHooks(boundRouteActions('summary'))} />
        <Route name="direct" path="filter/direct" component={Discussions} {...generateRouteHooks(boundRouteActions('direct'))} />
        <Route name="search" path="search" component={SearchFeed} {...generateRouteHooks(boundRouteActions('search'))} />
        <Route name="notifications" path="filter/notifications" component={lazyLoad('./components/notifications')} {...generateRouteHooks(boundRouteActions('notifications'))} />
        <Route name="best_of" path="filter/best_of" component={PlainFeed} {...generateRouteHooks(boundRouteActions('best_of'))} />
        <Route name="everything" path="filter/everything" component={PlainFeed} {...generateRouteHooks(boundRouteActions('everything'))} />
        <Route name="groups" path="/groups" component={Groups} onEnter={enterStaticPage('Groups')} />
        <Route name="friends" path="/friends" component={Friends} onEnter={friendsActions} />
        <Route name="groupCreate" path="/groups/create" component={lazyLoad('./components/group-create')} onEnter={enterStaticPage('Create a group')} />
        <Route name="archivePost" path="/archivePost" component={lazyLoad('./components/archive-post')} {...generateRouteHooks(boundRouteActions('archivePost'))} />
        <Route name="createInvitation" path="/invite" component={lazyLoad('./components/invitation-creation-form')} onEnter={inviteActions} />
        <Route name="signupByInvitation" path="/invited/:invitationId" component={SignupByInvitation} onEnter={boundRouteActions('signupByInvitation')} />
        <Route name="userFeed" path="/:userName" component={User} {...generateRouteHooks(boundRouteActions('userFeed'))} />
        <Route name="memories" path="/memories/:from" component={PlainFeed} {...generateRouteHooks(boundRouteActions('memories'))} />
        <Route name="userMemories" path="/:userName/memories/:from" component={PlainFeed} {...generateRouteHooks(boundRouteActions('userMemories'))} />
        <Route name="userSummary" path="/:userName/summary(/:days)" component={User} {...generateRouteHooks(boundRouteActions('userSummary'))} />
        <Route name="subscribers" path="/:userName/subscribers" component={Subscribers} onEnter={subscribersSubscriptionsActions} />
        <Route name="subscriptions" path="/:userName/subscriptions" component={Subscriptions} onEnter={subscribersSubscriptionsActions} />
        <Route name="manage-subscribers" path="/:userName/manage-subscribers" component={ManageSubscribers} onEnter={manageSubscribersActions} />
        <Route name="userComments" path="/:userName/comments" component={User} {...generateRouteHooks(boundRouteActions('userComments'))} />
        <Route name="userLikes" path="/:userName/likes" component={User} {...generateRouteHooks(boundRouteActions('userLikes'))} />
        <Route name="post" path="/:userName/:postId" component={SinglePost} {...generateRouteHooks(boundRouteActions('post'))} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
