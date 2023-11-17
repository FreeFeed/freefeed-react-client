/* global CONFIG */
import { Component, createRef, useCallback } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import * as _ from 'lodash-es';

import { getUserInfo, userCardClosing } from '../redux/action-creators';
import { initialAsyncState } from '../redux/async-helpers';
import { Throbber } from './throbber';
import UserFeedStatus from './user-feed-status';
import UserRelationshipStatus from './user-relationships-status';
import ErrorBoundary from './error-boundary';
import { userActions } from './select-utils';
import { UserPicture } from './user-picture';
import { useShowBanDialog } from './dialog/ban-dialog';
import { ButtonLink } from './button-link';

class UserCard extends Component {
  constructor(props) {
    super(props);

    this.arrowRef = createRef();

    // Load this user's info if it's not in the store already
    if (!props.user.id) {
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
    const {
      hidden,
      user: { username },
    } = this.props;
    this.props.hideByName(username, !hidden);
  };

  handleUnblockClick = () => {
    const { id, username } = this.props.user;
    this.props.unban({ username, id });
  };

  componentDidMount() {
    const updPosition = () =>
      updateArrowPosition(
        this.props.pivotRef.current,
        this.props.forwardedRef.current,
        this.arrowRef.current,
      ) && requestAnimationFrame(updPosition);
    updPosition();
  }

  componentWillUnmount() {
    const { id } = this.props.user;
    id && this.props.userCardClosing(id);
  }

  renderSubscribeBlock() {
    const { props } = this;

    const allowToSubscribe =
      !CONFIG.privacyControlGroups.disableSubscriptions ||
      !CONFIG.privacyControlGroups.groups[props.user.username];

    if (props.subscribed) {
      return (
        <span className="user-card-action">
          <a onClick={this.handleUnsubscribeClick}>Unsubscribe</a>
        </span>
      );
    } else if (!props.user.isGone) {
      if (props.user.isPrivate === '1') {
        if (props.hasRequestBeenSent) {
          return <span className="user-card-action">Subscription request sent</span>;
        }
        return (
          <span className="user-card-action">
            <a onClick={this.handleRequestSubscriptionClick}>Request a subscription</a>
          </span>
        );
      }
      if (allowToSubscribe) {
        return (
          <span className="user-card-action">
            <a onClick={this.handleSubscribeClick}>Subscribe</a>
          </span>
        );
      }
    }

    return null;
  }

  render() {
    const { props } = this;

    return (
      <div className="user-card" ref={props.forwardedRef}>
        <div className="user-card__arrow" ref={this.arrowRef} />
        <ErrorBoundary>
          {props.notFound ? (
            <div className="user-card-info">
              <div className="userpic loading" />
              <div className="names">User not found</div>
            </div>
          ) : !props.user.id ? (
            <div className="user-card-info">
              <div className="userpic loading" />
              <div className="names">
                <Throbber />
              </div>
            </div>
          ) : (
            <>
              <div className="user-card-info">
                <UserPicture large user={props.user} className="userpic" />

                <div className="names">
                  <Link to={`/${props.user.username}`} className="display-name" dir="auto">
                    {props.user.screenName}
                  </Link>
                  <br />

                  {props.user.screenName !== props.user.username && (
                    <span className="username">@{props.user.username}</span>
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
                  <ButtonLink onClick={this.handleUnblockClick}>Un-block</ButtonLink>
                </div>
              ) : !props.isItMe ? (
                <div className="user-card-actions">
                  {props.canAcceptDirects && (
                    <span className="user-card-action">
                      <Link to={`/filter/direct?to=${props.user.username}`}>Direct message</Link>
                    </span>
                  )}
                  {this.renderSubscribeBlock()}
                  {props.user.type !== 'group' && !props.subscribed ? (
                    <span className="user-card-action">
                      <BlockLink user={props.user} setOpened={props.setOpened} />
                    </span>
                  ) : props.amIGroupAdmin ? (
                    <span className="user-card-action">
                      <Link to={`/${props.user.username}/settings`}>Settings</Link>
                    </span>
                  ) : (
                    false
                  )}

                  {!props.user.isGone && (
                    <span className="user-card-action">
                      <ButtonLink onClick={this.handleShowOrHideClick}>
                        {props.hidden ? 'Show' : 'Hide'} posts
                      </ButtonLink>
                    </span>
                  )}
                </div>
              ) : (
                false
              )}
              <div className="user-card-actions user-card-errors">
                {props.subscribingStatus.error && props.subscribingStatus.errorText}
                {props.blockingStatus.error && props.blockingStatus.errorText}
              </div>
            </>
          )}
        </ErrorBoundary>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const me = state.user;
  let user = _.find(state.users, { username: ownProps.username }) || {};
  if (!user.id) {
    const id = state.userPastNames[ownProps.username];
    user = (id && state.users[id]) || {};
  }
  const notFound = !user.id && state.usersNotFound.includes(ownProps.username);

  return {
    me,
    user,
    notFound,
    isItMe: me.username === user.username,
    amISubscribedToUser: (me.subscriptions || []).includes(user.id),
    isUserSubscribedToMe: _.findIndex(me.subscribers, { id: user.id }) > -1,
    isUserBlockedByMe: (me.banIds || []).includes(user.id),
    subscribed: (me.subscriptions || []).includes(user.id),
    hasRequestBeenSent: (me.pendingSubscriptionRequests || []).includes(user.id),
    blocked: (me.banIds || []).includes(user.id),
    hidden: me.frontendPreferences.homefeed.hideUsers.includes(user.username),
    amIGroupAdmin: user.type === 'group' && (user.administrators || []).includes(me.id),
    canAcceptDirects: user.youCan?.includes('dm') ?? false,
    subscribingStatus: state.userActionsStatuses.subscribing[user.username] || initialAsyncState,
    blockingStatus: state.userActionsStatuses.blocking[user.username] || initialAsyncState,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...userActions(dispatch),
    getUserInfo: (username) => dispatch(getUserInfo(username)),
    userCardClosing: (userId) => dispatch(userCardClosing(userId)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);

function updateArrowPosition(leader, follower, arrow) {
  if (!leader || !follower || !arrow) {
    return false;
  }

  const minArrowGap = 14;
  const leaderBounds = leader.getBoundingClientRect();
  const followerBounds = follower.getBoundingClientRect();

  let arrowX = minArrowGap;
  if (leaderBounds.left + minArrowGap > followerBounds.left) {
    arrowX = leaderBounds.left - followerBounds.left + minArrowGap;
    if (arrowX > followerBounds.width - minArrowGap) {
      arrowX = followerBounds.width - minArrowGap;
    }
  }

  arrow.style.left = `${arrowX}px`;

  return true;
}

function BlockLink({ user, setOpened }) {
  const showBanDialog = useShowBanDialog(user);
  const onClick = useCallback(
    () => (showBanDialog(), setOpened(false)),
    [setOpened, showBanDialog],
  );
  return <ButtonLink onClick={onClick}>Block</ButtonLink>;
}
