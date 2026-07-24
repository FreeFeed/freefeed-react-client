/* global CONFIG */
import { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from '../services/nouter';

import PaginatedView from './paginated-view';
import Feed from './feed';
import { SignInLink } from './sign-in-link';
import { Twemoji } from './twemoji';

class UserFeed extends Component {
  render() {
    if (this.props.feedIsLoading) {
      // Nothing to show while feed is loading
      return false;
    }

    const {
      viewUser,
      authenticated,
      router: {
        location: { query },
      },
    } = this.props;
    const isBlocked = viewUser.blocked;
    const isPrivate = viewUser.isPrivate === '1' && !viewUser.subscribed && !viewUser.isItMe;
    const possiblyBlocked =
      viewUser.type === 'user' &&
      viewUser.isPrivate === '0' &&
      (!('offset' in query) || query.offset === '0');

    const emptyFeedMessage = possiblyBlocked && (
      <p>
        Perhaps <b><Twemoji>{viewUser.screenName}</Twemoji></b> has not written any posts yet
        {authenticated ? ' or they have blocked you' : ''}.
      </p>
    );

    if (viewUser.isGone) {
      return (
        <div className="box-body">
          <p className="alert alert-warning">
            <UserGonePanel user={viewUser} />
          </p>
        </div>
      );
    }

    if (isBlocked) {
      return (
        <div className="box-body">
          <p>
            You have blocked <b><Twemoji>{viewUser.screenName}</Twemoji></b>, so all of their posts
            and comments are invisible to you.
          </p>
        </div>
      );
    }

    let privacyMessage;
    if (isPrivate) {
      privacyMessage = (
        <div className="box-body">
          <p>
            <b><Twemoji>{viewUser.screenName}</Twemoji></b> has a private feed.
          </p>
          {!authenticated && (
            <p>
              <Link to="/signup">Sign up</Link> (or <SignInLink>sign in</SignInLink>) and request a
              subscription to see posts from <b><Twemoji>{viewUser.screenName}</Twemoji></b>.
            </p>
          )}
        </div>
      );
    } else if (viewUser.isProtected === '1' && !authenticated) {
      privacyMessage = (
        <div className="box-body">
          <p>
            <b><Twemoji>{viewUser.screenName}</Twemoji></b> has a protected feed. It is only visible
            to {CONFIG.siteTitle} users.
          </p>
          <p>
            <Link to="/signup">Sign up</Link> or <SignInLink>sign in</SignInLink> to see posts from{' '}
            <b><Twemoji>{viewUser.screenName}</Twemoji></b>.
          </p>
        </div>
      );
    }

    return (
      <>
        {privacyMessage}
        <PaginatedView {...this.props}>
          <Feed {...this.props} emptyFeedMessage={emptyFeedMessage} />
        </PaginatedView>
      </>
    );
  }
}

function select(state) {
  return {
    feedIsLoading: state.routeLoadingState,
    authenticated: state.authenticated,
  };
}

export default connect(select)(UserFeed);

function UserGonePanel({ user }) {
  if (!user.isGone) {
    return null;
  }
  if (user.goneStatus === 'paused') {
    if (user.description) {
      return (
        <>
          <b><Twemoji>{user.screenName}</Twemoji></b> has paused their account and left a message:{' '}
          <em><Twemoji>{user.description}</Twemoji></em>
        </>
      );
    }
    return (
      <>
        <b><Twemoji>{user.screenName}</Twemoji></b> has paused their account. They may return
        someday.
      </>
    );
  }
  return (
    <>
      <b><Twemoji>{user.screenName}</Twemoji></b> account has been deleted. This page still exists
      as a stub for the username, but this {user.type} is not in FreeFeed anymore.
    </>
  );
}
