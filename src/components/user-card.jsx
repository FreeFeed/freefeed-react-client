import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { getUserInfo, updateUserPreferences, userCardClosing } from '../redux/action-creators';
import { initialAsyncState } from '../redux/async-helpers';
import { Throbber } from './throbber';
import UserFeedStatus from './user-feed-status';
import UserRelationshipStatus from './user-relationships-status';
import ErrorBoundary from './error-boundary';
import { userActions, canAcceptDirects } from './select-utils';

class UserCard extends React.Component {
  constructor(props) {
    super(props);

    // Load this user's info if it's not in the store already
    // or we have not its 'acceptsDirects' field
    if (!props.user.id || props.canAcceptDirects === undefined) {
      setTimeout(() => props.getUserInfo(props.username), 0);
    }
  }

  handleSubscribeClick = () => {
    const { username, id } = this.props.user;
    this.props.subscribe({ username, id });
  };

  handleUnsubscribeClick = () => {
    if (this.props.amIGroupAdmin) {
      alert(
        'You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first.',
      );
      return;
    }

    const { username, id } = this.props.user;
    if (window.confirm(`Are you sure you want to unsubscribe from @${username}?`)) {
      this.props.unsubscribe({ username, id });
    }
  };

  handleRequestSubscriptionClick = () => {
    const { id, username } = this.props.user;
    this.props.sendSubscriptionRequest({ id, username });
  };

  handleShowOrHideClick = () => {
    const { username } = this.props.user;
    this.props.hideShowUser(this.props.me, username);
  };

  handleBlockClick = () => {
    const { id, username } = this.props.user;
    this.props.ban({ id, username });
  };

  handleUnblockClick = () => {
    const { id, username } = this.props.user;
    this.props.unban({ username, id });
  };

  componentWillUnmount() {
    const { id } = this.props.user;
    id && this.props.userCardClosing(id);
  }

  render() {
    const { props } = this;
    const style = { top: `${this.props.top + 10}px`, left: `${this.props.left}px` };

    if (props.notFound) {
      return (
        <div className="user-card" style={style}>
          <div className="user-card-info">
            <div className="userpic loading" />
            <div className="names">User not found</div>
          </div>
        </div>
      );
    }

    if (!props.user.id) {
      return (
        <div className="user-card" style={style}>
          <div className="user-card-info">
            <div className="userpic loading" />
            <div className="names">
              <Throbber />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="user-card" style={style}>
        <ErrorBoundary>
          <div className="user-card-info">
            <Link to={`/${props.user.username}`} className="userpic">
              <img src={props.user.profilePictureLargeUrl} width="75" height="75" />
            </Link>

            <div className="names">
              <Link to={`/${props.user.username}`} className="display-name" dir="auto">
                {props.user.screenName}
              </Link>
              <br />

              {props.user.screenName !== props.user.username ? (
                <span className="username">@{props.user.username}</span>
              ) : (
                false
              )}
            </div>

            {!props.isItMe && (
              <div className="feed-status">
                <UserFeedStatus {...props.user} />
              </div>
            )}
            <div className="relationship-status">
              {props.isItMe ? (
                "It's you!"
              ) : (
                <UserRelationshipStatus type={props.user.type} {...props} />
              )}
            </div>
          </div>

          {props.blocked ? (
            <div className="user-card-actions">
              <span>Blocked user - </span>
              <a onClick={this.handleUnblockClick}>Un-block</a>
            </div>
          ) : !props.isItMe ? (
            <div className="user-card-actions">
              {props.canAcceptDirects ? (
                <span>
                  <Link to={`/filter/direct?to=${props.user.username}`}>Direct message</Link>
                  <span> - </span>
                </span>
              ) : (
                false
              )}
              {props.user.isPrivate === '1' && !props.subscribed ? (
                props.hasRequestBeenSent ? (
                  <span>Subscription request sent</span>
                ) : (
                  <a onClick={this.handleRequestSubscriptionClick}>Request a subscription</a>
                )
              ) : props.subscribed ? (
                <a onClick={this.handleUnsubscribeClick}>Unsubscribe</a>
              ) : (
                <a onClick={this.handleSubscribeClick}>Subscribe</a>
              )}

              {props.user.type !== 'group' && !props.subscribed ? (
                <span>
                  {' '}
                  - <a onClick={this.handleBlockClick}>Block</a>
                </span>
              ) : props.amIGroupAdmin ? (
                <span>
                  {' '}
                  - <Link to={`/${props.user.username}/settings`}>Settings</Link>
                </span>
              ) : (
                false
              )}

              <span>
                {' '}
                - <a onClick={this.handleShowOrHideClick}>{props.hidden ? 'Show' : 'Hide'} posts</a>
              </span>
            </div>
          ) : (
            false
          )}
          <div className="user-card-actions user-card-errors">
            {props.subscribingStatus.error && props.subscribingStatus.errorText}
            {props.blockingStatus.error && props.blockingStatus.errorText}
          </div>
        </ErrorBoundary>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const me = state.user;
  const user = _.find(state.users, { username: ownProps.username }) || {};
  const notFound = !user.id && state.usersNotFound.indexOf(ownProps.username) >= 0;

  return {
    me,
    user,
    notFound,
    isItMe: me.username === user.username,
    amISubscribedToUser: (me.subscriptions || []).indexOf(user.id) > -1,
    isUserSubscribedToMe: _.findIndex(me.subscribers, { id: user.id }) > -1,
    isUserBlockedByMe: (me.banIds || []).indexOf(user.id) > -1,
    subscribed: (me.subscriptions || []).indexOf(user.id) > -1,
    hasRequestBeenSent: (me.pendingSubscriptionRequests || []).indexOf(user.id) > -1,
    blocked: (me.banIds || []).indexOf(user.id) > -1,
    hidden: me.frontendPreferences.homefeed.hideUsers.indexOf(user.username) > -1,
    amIGroupAdmin: user.type === 'group' && (user.administrators || []).indexOf(me.id) > -1,
    canAcceptDirects: canAcceptDirects(user, state),
    subscribingStatus: state.userActionsStatuses.subscribing[user.id] || initialAsyncState,
    blockingStatus: state.userActionsStatuses.blocking[user.id] || initialAsyncState,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...userActions(dispatch),
    getUserInfo: (username) => dispatch(getUserInfo(username)),
    hideShowUser: (me, username) => {
      const {
        homefeed: { hideUsers },
      } = me.frontendPreferences;
      const p = hideUsers.indexOf(username);
      if (p < 0) {
        hideUsers.push(username);
      } else {
        hideUsers.splice(p, 1);
      }
      dispatch(
        updateUserPreferences(me.id, {
          ...me.frontendPreferences,
          homefeed: { ...me.frontendPreferences.homefeed, hideUsers },
        }),
      );
    },
    userCardClosing: (userId) => dispatch(userCardClosing(userId)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserCard);
