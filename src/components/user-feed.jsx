import React from 'react';
import { connect } from 'react-redux';

import PaginatedView from './paginated-view';
import Feed from './feed';

class UserFeed extends React.Component {
  unblock = () =>
    this.props.userActions.unban({
      username: this.props.viewUser.username,
      id: this.props.viewUser.id,
    });

  render() {
    if (this.props.feedIsLoading) {
      // Nothing to show while feed is loading
      return false;
    }

    const {
      viewUser,
      visibleEntries,
      authenticated,
      location: { query },
    } = this.props;
    const isBlocked = viewUser.blocked;
    const isPrivate = viewUser.isPrivate === '1' && !viewUser.subscribed && !viewUser.isItMe;
    const amIBlocked =
      viewUser.isPrivate === '0' &&
      viewUser.statistics.posts !== '0' &&
      visibleEntries.length === 0 &&
      (!('offset' in query) || query.offset === '0');

    if (isBlocked) {
      return (
        <div className="box-body">
          <p>
            You have blocked <b>{viewUser.screenName}</b>, so all of their posts and comments are
            invisible to you.
          </p>
          <p>
            <a onClick={this.unblock}>Un-block</a>
          </p>
        </div>
      );
    }

    if (isPrivate) {
      return (
        <div className="box-body">
          <p>
            <b>{viewUser.screenName}</b> has a private feed.
          </p>
        </div>
      );
    } else if (viewUser.isProtected === '1' && !authenticated) {
      return (
        <div className="box-body">
          <p>
            <b>{viewUser.screenName}</b> has a protected feed. It is only visible to FreeFeed users.
          </p>
        </div>
      );
    }

    if (amIBlocked) {
      return (
        <div className="box-body">
          <p>
            Nothing to show here. Perhaps <b>{viewUser.screenName}</b> has not written any posts yet
            {authenticated ? ' or they have blocked you' : ''}.
          </p>
        </div>
      );
    }

    return (
      <PaginatedView {...this.props}>
        <Feed {...this.props} isInUserFeed={true} />
      </PaginatedView>
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
