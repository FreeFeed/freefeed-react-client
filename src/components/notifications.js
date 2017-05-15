import React from "react";
import {connect} from "react-redux";
import {Link} from "react-router";
import Linkify from "./linkify";
import TimeDisplay from "./time-display";
import PaginatedView from "./paginated-view";

const generatePostUrl = (user, group, postId) => `/${(group||user).username}/${postId}`;
const postLink = event => <Link to={generatePostUrl(event.group, event.createdUser, event.post_id)}>post</Link>;
const directPostLink = event => <Link to={generatePostUrl(event.group, event.createdUser, event.post_id)}>direct message</Link>;

const notificationTemplates = {
  subscription_request_revoked: (event) => <Linkify>{`You revoked your subscription request to @${event.targetUser.username}`}</Linkify>,

  mention_in_post: (event) => <div><Linkify>{`@${event.createdUser.username} mentioned you in the `}</Linkify>{postLink(event)}<Linkify>{` ${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify></div>,
  mention_in_comment: (event) => <div><Linkify>{`@${event.createdUser.username} mentioned you in a comment to the `}</Linkify>{postLink(event)}<Linkify>{`${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify></div>,
  mention_comment_to: (event) => <div><Linkify>{`@${event.createdUser.username} replied to you in the `}</Linkify>{postLink(event)}<Linkify>{` ${event.group.username ? `[in @${event.group.username}]` : ''}`}</Linkify></div>,
  banned_user: (event) => <Linkify>{`You blocked @${event.createdUser.username}`}</Linkify>,
  unbanned_user: (event) => <Linkify>{`You unblocked @${event.createdUser.username}`}</Linkify>,
  subscription_requested: (event) => <Linkify>{`@${event.createdUser.username} sent you a subscription request`}</Linkify>,
  user_subscribed: (event) => <Linkify>{`@${event.createdUser.username} subscribed to your feed`}</Linkify>,
  user_unsubscribed: (event) => <Linkify>{`@${event.createdUser.username} unsubscribed from your feed`}</Linkify>,
  subscription_request_approved: (event) => <Linkify>{`Your subscription request to @${event.affectedUser.username} name was approved`}</Linkify>,
  subscription_request_rejected: (event) => <Linkify>{`Your subscription request to @${event.affectedUser.username} name was rejected`}</Linkify>,
  group_created: (event) => <Linkify>{`You created a group @${event.group.username}`}</Linkify>,
  group_subscription_requested: (event) => <Linkify>{`@${event.createdUser.username} sent a subscription request to join @${event.group.username} that you admin `}</Linkify>,
  group_admin_promoted: (event) => <Linkify>{`@${event.createdUser.username} promoted @${event.targetUser.username} to admin in the group @${event.group.username}`}</Linkify>,
  group_admin_demoted: (event) => <Linkify>{`@${event.createdUser.username} revoked admin privileges from @${event.targetUser.username} in group @${event.group.username}`}</Linkify>,
  group_subscription_approved: (event) => <Linkify>{`Your request to join group @${event.group.username} was approved`}</Linkify>,
  group_subscription_request_revoked: (event) => <Linkify>{`@${event.createdUser.username} revoked subscription request to @${event.group.username}`}</Linkify>,
  direct: (event) => <div><Linkify>{`You received a `}</Linkify>{directPostLink(event)}<Linkify>{` from @${event.createdUser.username}`}</Linkify></div>,
  direct_comment: (event) => <div><Linkify>{`New comment was posted to a `}</Linkify>{directPostLink(event)}<Linkify>{` from @${event.createdUser.username}`}</Linkify></div>,
  group_subscription_rejected: (event) => event.isMineGroup
                                ? <Linkify>{`@${event.affectedUser.username} subscription request to join @${event.group.username} was rejected by @${event.createdUser.username}`}</Linkify>
                                : <Linkify>{`Your request to join group @${event.group.username} was rejected`}</Linkify>,
  group_subscribed: (event) => event.isMineGroup
                                ? <Linkify>{`@${event.createdUser.username} subscribed to @${event.group.username}`}</Linkify>
                                : <Linkify>{`You subscribed to group @${event.group.username}`}</Linkify>,
  group_unsubscribed: (event) => event.isMineGroup
                                ? <Linkify>{`@${event.createdUser.username} unsubscribed from @${event.group.username}`}</Linkify>
                                : <Linkify>{`You unsubscribed from group @${event.group.username}`}</Linkify>,

  banned_by_user: () => `Notification shouldn't be shown`,
  unbanned_by_user: () => `Notification shouldn't be shown`,
};

const nop = () => false;

const Notification = ({event_type, ...props}) => {
  return (
    <div key={props.id} className="single-notification">
      {(notificationTemplates[event_type] || nop)(props)}
      <TimeDisplay timeStamp={props.date}/>
    </div>);
};

const toggleStringArrayElement = element => stringArray => {
  if (!stringArray) {
    return element;
  }
  const array = stringArray.split(",");
  const elementIndex = array.indexOf(element);
  if (elementIndex === -1) {
    return [...array, element].join(",");
  }
  return array.slice(0, elementIndex).concat(array.slice(elementIndex+1)).join(",");
};

const toggleMentions = toggleStringArrayElement("mentions");
const toggleSubscriptions = toggleStringArrayElement("subscriptions");
const toggleGroups = toggleStringArrayElement("groups");
const toggleDirects = toggleStringArrayElement("directs");
const toggleBans = toggleStringArrayElement("bans");

const composeQuery = filter => filter ? {filter} : {};

const isFilterActive = (filterName, filter) => filter && filter.indexOf(filterName) !== -1;

const Notifications = (props) => (
  <div className="content notifications">
    <div className="box">
      <div className="box-header-timeline">
        Notifications
      </div>
      <div className="filter">
        <div>Show: </div>
        <Link className={!props.location.query.filter ? "active" : ""} to={{pathname: props.location.pathname, query: {}}}>Everything</Link>
        <Link className={isFilterActive("mentions", props.location.query.filter) ? "active" : ""} to={{pathname: props.location.pathname, query: composeQuery(toggleMentions(props.location.query.filter))}}>Mentions</Link>
        <Link className={isFilterActive("subscriptions", props.location.query.filter) ? "active" : ""} to={{pathname: props.location.pathname, query: composeQuery(toggleSubscriptions(props.location.query.filter))}}>Subscriptions</Link>
        <Link className={isFilterActive("groups", props.location.query.filter) ? "active" : ""} to={{pathname: props.location.pathname, query: composeQuery(toggleGroups(props.location.query.filter))}}>Groups</Link>
        <Link className={isFilterActive("directs", props.location.query.filter) ? "active" : ""} to={{pathname: props.location.pathname, query: composeQuery(toggleDirects(props.location.query.filter))}}>Direct messages</Link>
        <Link className={isFilterActive("bans", props.location.query.filter) ? "active" : ""} to={{pathname: props.location.pathname, query: composeQuery(toggleBans(props.location.query.filter))}}>Bans</Link>
      </div>
      <PaginatedView routes={props.routes} location={props.location}>
        <div className="notification-list">
          {props.loading
            ? "Loading"
            : props.events.map(Notification)
          }
        </div>
      </PaginatedView>
    </div>
  </div>
);

const mock = {};

const mapStateToProps = (state) => {
  return {
    isLoading: state.notifications.isLoading,
    filter: state.routing.locationBeforeTransitions.query.filter,
    events: (state.notifications.events || []).map(event => {
      return {
        ...event,
        createdUser: state.users[event.created_user_id] || state.subscribers[event.created_user_id] || mock,
        createdByUser: state.users[event.created_by_user_id] || state.subscribers[event.created_by_user_id] || mock,
        affectedUser: state.users[event.affected_user_id] || state.subscribers[event.affected_user_id] || mock,
        targetUser: state.users[event.target_user_id] || state.subscribers[event.target_user_id] || mock,
        group: state.groups[event.group_id] || mock,
        isMineGroup: !!state.managedGroups.find(gr => gr.id === event.group_id),
        post: state.posts[event.post_id] || mock,
        comment: state.comments[event.comment_id] || mock,
      };
    }),
  };
};

export default connect(mapStateToProps)(Notifications);
