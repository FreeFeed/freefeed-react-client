import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import throbber16 from '../../assets/images/throbber-16.gif';
import Linkify from "./linkify";
import TimeDisplay from "./time-display";
import PaginatedView from "./paginated-view";

const getAuthorName = ({ postAuthor, createdUser, group }) => {
  if (group && group.username) {
    return group.username;
  }
  if (postAuthor && postAuthor.username) {
    return postAuthor.username;
  }
  return createdUser.username;
};

const generatePostUrl = ({ ...event, post_id }) => `/${getAuthorName(event)}/${post_id}`;
const generateCommentUrl = ({ ...event, post_id, comment_id }) => `/${getAuthorName(event)}/${post_id}#comment-${comment_id}`;
const postLink = (event) => <Link to={generatePostUrl(event)}>post</Link>;
const directPostLink = (event) => <Link to={generatePostUrl(event)}>direct message</Link>;
const commentLink = (event, text = 'comment') => <Link to={generateCommentUrl(event)}>{text}</Link>;

const notificationTemplates = {
  subscription_request_revoked: (event) => <Linkify>{`@${event.createdUser.username} revoked subscription request to you`}</Linkify>,

  mention_in_post: (event) => <div><Linkify>{`@${event.createdUser.username} mentioned you in the `}</Linkify>{postLink(event)}<Linkify>{` ${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify></div>,
  mention_in_comment: (event) => <div><Linkify>{`@${event.createdUser.username} mentioned you in a `}</Linkify>{commentLink(event, 'comment')}{` to the `}{postLink(event)}<Linkify>{`${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify></div>,
  mention_comment_to: (event) => <div><Linkify>{`@${event.createdUser.username} `}</Linkify>{commentLink(event, 'replied')}{` to you in the `}{postLink(event)}<Linkify>{` ${event.group.username ? `[in @${event.group.username}]` : ''}`}</Linkify></div>,
  banned_user: (event) => <Linkify>{`You blocked @${event.affectedUser.username}`}</Linkify>,
  unbanned_user: (event) => <Linkify>{`You unblocked @${event.affectedUser.username}`}</Linkify>,
  subscription_requested: (event) => <Linkify>{`@${event.createdUser.username} sent you a subscription request`}</Linkify>,
  user_subscribed: (event) => <Linkify>{`@${event.createdUser.username} subscribed to your feed`}</Linkify>,
  user_unsubscribed: (event) => <Linkify>{`@${event.createdUser.username} unsubscribed from your feed`}</Linkify>,
  subscription_request_approved: (event) => <Linkify>{`Your subscription request to @${event.createdUser.username} was approved`}</Linkify>,
  subscription_request_rejected: (event) => <Linkify>{`Your subscription request to @${event.createdUser.username} was rejected`}</Linkify>,
  group_created: (event) => <Linkify>{`You created a group @${event.group.username}`}</Linkify>,
  group_subscription_requested: (event) => <Linkify>{`@${event.createdUser.username} sent a subscription request to join @${event.group.username} that you admin `}</Linkify>,
  group_admin_promoted: (event) => <Linkify>{`@${event.createdUser.username} promoted @${event.affectedUser.username} to admin in the group @${event.group.username}`}</Linkify>,
  group_admin_demoted: (event) => <Linkify>{`@${event.createdUser.username} revoked admin privileges from @${event.affectedUser.username} in group @${event.group.username}`}</Linkify>,
  managed_group_subscription_approved: (event) => <Linkify>{`@${event.affectedUser.username} subscription request to join @${event.group.username} was approved by @${event.createdUser.username}`}</Linkify>,
  managed_group_subscription_rejected: (event) => <Linkify>{`@${event.affectedUser.username} subscription request to join @${event.group.username} was rejected`}</Linkify>,
  group_subscription_approved: (event) => <Linkify>{`Your request to join group @${event.group.username} was approved`}</Linkify>,
  group_subscription_request_revoked: (event) => <Linkify>{`@${event.createdUser.username} revoked subscription request to @${event.group.username}`}</Linkify>,
  direct: (event) => <div>{`You received a `}{directPostLink(event)}<Linkify>{` from @${event.createdUser.username}`}</Linkify></div>,
  direct_comment: (event) => <div>{`New `}{commentLink(event)}{` was posted to a `}{directPostLink(event)}<Linkify>{` from @${event.createdUser.username}`}</Linkify></div>,
  group_subscription_rejected: (event) => <Linkify>{`Your request to join group @${event.group.username} was rejected`}</Linkify>,
  group_subscribed: (event) => <Linkify>{`@${event.createdUser.username} subscribed to @${event.group.username}`}</Linkify>,
  group_unsubscribed: (event) => <Linkify>{`@${event.createdUser.username} unsubscribed from @${event.group.username}`}</Linkify>,

  banned_by_user: () => `Notification shouldn't be shown`,
  unbanned_by_user: () => `Notification shouldn't be shown`,
};

const notificationClasses = {
  mention_in_post: 'mention',
  mention_in_comment: 'mention',
  mention_comment_to: 'mention',
  banned_user: 'ban',
  unbanned_user: 'ban',
  subscription_requested: 'subscription',
  subscription_request_revoked: 'subscription',
  user_subscribed: 'subscription',
  user_unsubscribed: 'subscription',
  subscription_request_approved: 'subscription',
  subscription_request_rejected: 'subscription',
  group_created: 'group',
  group_subscription_requested: 'group',
  group_admin_promoted: 'group',
  group_admin_demoted: 'group',
  group_subscription_approved: 'group',
  group_subscription_request_revoked: 'group',
  group_subscription_rejected: 'group',
  group_subscribed: 'group',
  group_unsubscribed: 'group',
  managed_group_subscription_approved: 'group',
  managed_group_subscription_rejected: 'group',
  direct: 'direct',
  direct_comment: 'direct',
  banned_by_user: 'ban',
  unbanned_by_user: 'ban',
};

const nop = () => false;

const Notification = ({ event_type, ...props }) => {
  return (
    <div key={props.id} className={`single-notification ${notificationClasses[event_type] || ""}`}>
      {(notificationTemplates[event_type] || nop)(props)}
      <TimeDisplay timeStamp={props.date}/>
    </div>);
};

const isFilterActive = (filterName, filter) => filter && filter.indexOf(filterName) !== -1;

const Notifications = (props) => (
  <div className="box notifications">
    <div className="box-header-timeline">
      Notifications
      {props.isLoading && (
        <span className="notifications-throbber">
          <img width="16" height="16" src={throbber16}/>
        </span>
      )}
    </div>
    <div className="filter">
      <div>Show: </div>
      <Link className={!props.location.query.filter ? "active" : ""} to={{ pathname: props.location.pathname, query: {} }}>Everything</Link>
      <Link className={isFilterActive("mentions", props.location.query.filter) ? "active" : ""} to={{ pathname: props.location.pathname, query: { filter:"mentions" } }}>Mentions</Link>
      <Link className={isFilterActive("subscriptions", props.location.query.filter) ? "active" : ""} to={{ pathname: props.location.pathname, query: { filter:"subscriptions" } }}>Subscriptions</Link>
      <Link className={isFilterActive("groups", props.location.query.filter) ? "active" : ""} to={{ pathname: props.location.pathname, query: { filter: "groups" } }}>Groups</Link>
      <Link className={isFilterActive("directs", props.location.query.filter) ? "active" : ""} to={{ pathname: props.location.pathname, query: { filter: "directs" } }}>Direct messages</Link>
      <Link className={isFilterActive("bans", props.location.query.filter) ? "active" : ""} to={{ pathname: props.location.pathname, query: { filter: "bans" } }}>Bans</Link>
    </div>
    {props.authenticated
      ?
      <PaginatedView routes={props.routes} location={props.location}>
        <div className="notification-list">
          {props.loading
            ? "Loading"
            : props.events.length > 0 ? props.events.map(Notification) : "No notifications yet"
          }
        </div>
      </PaginatedView>
      :
      <div className="alert alert-danger" role="alert">You must <Link to="/signin">sign in</Link> or <Link to="/signup">sign up</Link> before visiting this page.</div>
    }
  </div>
);

const mock = {};

const mapStateToProps = (state) => {
  return {
    isLoading: state.notifications.loading,
    filter: state.routing.locationBeforeTransitions.query.filter,
    authenticated: state.authenticated,
    events: (state.notifications.events || []).map((event) => {
      return {
        ...event,
        createdUser: state.users[event.created_user_id] || state.subscribers[event.created_user_id] || mock,
        affectedUser: state.users[event.affected_user_id] || state.subscribers[event.affected_user_id] || mock,
        group: state.groups[event.group_id] || mock,
        postAuthor: state.users[event.post_author_id],
        post: state.posts[event.post_id] || mock,
        comment: state.comments[event.comment_id] || mock,
      };
    }),
  };
};

export default connect(mapStateToProps)(Notifications);
