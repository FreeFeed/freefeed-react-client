/* global CONFIG */
import { useMemo } from 'react';
import { connect, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { faClock } from '@fortawesome/free-solid-svg-icons';

import { Throbber } from './throbber';
import Linkify from './linkify';
import TimeDisplay from './time-display';
import PaginatedView from './paginated-view';
import ErrorBoundary from './error-boundary';
import { UserPicture } from './user-picture';
import UserName from './user-name';
import { Icon } from './fontawesome-icons';
import { SingleComment, SinglePost } from './notification-body';
import { SignInLink } from './sign-in-link';

const getAuthorName = ({ postAuthor, createdUser, group }) => {
  if (group && group.username) {
    return group.username;
  }
  if (postAuthor && postAuthor.username) {
    return postAuthor.username;
  }
  return createdUser.username;
};

const generatePostUrl = ({ post_id, ...event }) => `/${getAuthorName(event)}/${post_id}`;
const generateCommentUrl = ({ post_id, comment_id, ...event }) =>
  `/${getAuthorName(event)}/${post_id}#comment-${comment_id}`;
const postLink = (event) =>
  event.post_id ? <Link to={generatePostUrl(event)}>post</Link> : 'deleted post';
const directPostLink = (event) =>
  event.post_id ? (
    <Link to={generatePostUrl(event)}>direct message</Link>
  ) : (
    'deleted direct message'
  );
const commentLink = (event, text = 'comment') =>
  event.comment_id ? (
    <Link to={generateCommentUrl(event)}>{text}</Link>
  ) : text === 'comment' ? (
    'deleted comment'
  ) : text === 'New comment' ? (
    'Deleted comment'
  ) : (
    text
  );

const backlinkLink = (event) =>
  event.target_comment_id ? (
    <Link to={`/post/${event.target_post_id}#comment-${event.target_comment_id}`}>comment</Link>
  ) : event.target_post_id ? (
    <Link to={`/post/${event.target_post_id}`}>post</Link>
  ) : (
    'deleted entry'
  );

const notificationTemplates = {
  subscription_request_revoked: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' revoked subscription request to you'}
    </div>
  ),

  mention_in_post: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' mentioned you in the '}
      {postLink(event)}
      <Linkify>{` ${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify>
      <SinglePost id={event.post_id} />
    </div>
  ),
  mention_in_comment: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' mentioned you in a '}
      {commentLink(event, 'comment')}
      {` to the `}
      {postLink(event)}
      <Linkify>{` ${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify>
      <SingleComment id={event.comment_id} />
    </div>
  ),
  mention_comment_to: (event) => (
    <div>
      <UserName user={event.createdUser} /> {commentLink(event, 'replied')}
      {` to you in the `}
      {postLink(event)}
      <Linkify>{` ${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify>
      <SingleComment id={event.comment_id} />
    </div>
  ),
  backlink_in_comment: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' mentioned your '}
      {backlinkLink(event)} in a {commentLink(event, 'comment')}
      {` to the `}
      {postLink(event)}
      <Linkify>{` ${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify>
      <SingleComment id={event.comment_id} />
    </div>
  ),
  backlink_in_post: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' mentioned your '}
      {backlinkLink(event)} in the {postLink(event)}
      <Linkify>{` ${event.group.username ? ` [in @${event.group.username}]` : ''}`}</Linkify>
      <SinglePost id={event.post_id} />
    </div>
  ),
  banned_user: (event) => (
    <div>
      {'You blocked '}
      <UserName user={event.affectedUser} />
    </div>
  ),
  unbanned_user: (event) => (
    <div>
      {'You unblocked '}
      <UserName user={event.affectedUser} />
    </div>
  ),
  subscription_requested: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' sent you a subscription request '}
      <ReviewRequestLink from={event.createdUser} />
    </div>
  ),
  user_subscribed: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' subscribed to your feed'}
    </div>
  ),
  user_unsubscribed: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' unsubscribed from your feed'}
    </div>
  ),
  subscription_request_approved: (event) => (
    <div>
      {'Your subscription request to '}
      <UserName user={event.createdUser} />
      {' was approved'}
    </div>
  ),
  subscription_request_rejected: (event) => (
    <div>
      {'Your subscription request to '}
      <UserName user={event.createdUser} />
      {' was rejected'}
    </div>
  ),
  group_created: (event) => (
    <div>
      {'You created a group '}
      <UserName user={event.group} />
    </div>
  ),
  group_subscription_requested: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' sent a request to join '}
      <UserName user={event.group} />
      {' that you admin'} <ReviewRequestLink from={event.createdUser} group={event.group} />
    </div>
  ),
  group_admin_promoted: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' promoted '}
      <UserName user={event.affectedUser} />
      {' to admin in the group '}
      <UserName user={event.group} />
    </div>
  ),
  group_admin_demoted: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' revoked admin privileges from '}
      <UserName user={event.affectedUser} />
      {' in group '}
      <UserName user={event.group} />
    </div>
  ),
  managed_group_subscription_approved: (event) => (
    <div>
      <UserName user={event.affectedUser} />
      {' request to join '}
      <UserName user={event.group} />
      {' was approved by '}
      <UserName user={event.createdUser} />
    </div>
  ),
  managed_group_subscription_rejected: (event) => (
    <div>
      <UserName user={event.affectedUser} />
      {' request to join '}
      <UserName user={event.group} />
      {' was rejected'}
    </div>
  ),
  group_subscription_approved: (event) => (
    <div>
      {'Your request to join group '}
      <UserName user={event.group} />
      {' was approved'}
    </div>
  ),
  group_subscription_request_revoked: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' revoked subscription request to '}
      <UserName user={event.group} />
    </div>
  ),
  direct_left: (event) =>
    event.created_user_id === event.receiver.id ? (
      <div>
        {'You left a direct message created by '}
        <UserName user={event.postAuthor} />
      </div>
    ) : event.post_author_id === event.receiver.id ? (
      <div>
        <UserName user={event.createdUser} />
        {' left a '} {directPostLink(event)} {' created by you'}
      </div>
    ) : (
      <div>
        <UserName user={event.createdUser} />
        {' left a '} {directPostLink(event)} {' created by '}
        <UserName user={event.postAuthor} />
      </div>
    ),
  direct: (event) => (
    <div>
      {`You received a `}
      {directPostLink(event)}
      {` from `}
      <UserName user={event.createdUser} />
      <SinglePost id={event.post_id} />
    </div>
  ),
  direct_comment: (event) => (
    <div>
      {commentLink(event, 'New comment')}
      {' was posted to a '}
      {directPostLink(event)}
      {' from '}
      <UserName user={event.createdUser} />
      <SingleComment id={event.comment_id} />
    </div>
  ),
  group_subscription_rejected: (event) => (
    <div>
      {'Your request to join group '} <UserName user={event.group} /> {' was rejected'}
    </div>
  ),
  group_subscribed: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' subscribed to '} <UserName user={event.group} />
    </div>
  ),
  group_unsubscribed: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' unsubscribed from '} <UserName user={event.group} />
    </div>
  ),
  invitation_used: (event) => (
    <div>
      <UserName user={event.createdUser} />
      {' has joined '} ${CONFIG.siteTitle} {' using your invitation '}
    </div>
  ),

  banned_by_user: () => `Notification shouldn't be shown`,
  unbanned_by_user: () => `Notification shouldn't be shown`,

  comment_moderated: (event) => (
    <div>
      <UserName user={event.createdUser} /> {' has deleted your comment to the '}
      {postLink(event)}
      {event.group_id ? (
        <span>
          {' in the group '}
          <UserName user={event.group} />
        </span>
      ) : null}
    </div>
  ),
  comment_moderated_by_another_admin: (event) => (
    <div>
      <UserName user={event.createdUser} /> {' has removed a comment from '}{' '}
      <UserName user={event.affectedUser} /> {' to the '}
      {postLink(event)}
      {' in the group '}
      <UserName user={event.group} />
    </div>
  ),
  post_moderated: (event) => (
    <div>
      <UserName user={event.createdUser} /> {' has removed your '}
      {event.post_id ? postLink(event) : 'post'}
      {event.group_id ? (
        <span>
          {' from the group '}
          <UserName user={event.group} />
        </span>
      ) : null}
    </div>
  ),
  post_moderated_by_another_admin: (event) => (
    <div>
      <UserName user={event.createdUser} /> {' has removed the '}
      {event.post_id ? postLink(event) : 'post'}
      {' from '}
      <UserName user={event.affectedUser} />
      {event.group_id ? (
        <span>
          {` from the group `}
          <UserName user={event.group} />
        </span>
      ) : null}
    </div>
  ),
};

const notificationClasses = {
  mention_in_post: 'mention',
  mention_in_comment: 'mention',
  mention_comment_to: 'mention',
  banned_user: 'ban',
  unbanned_user: 'ban',
  invitation_used: 'subscription',
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
  comment_moderated: 'group',
  comment_moderated_by_another_admin: 'group',
  post_moderated: 'group',
  post_moderated_by_another_admin: 'group',
};

const nop = () => false;

const Notification = ({ event_type, ...props }) => {
  return (
    <div key={props.id} className={`post timeline-post ${notificationClasses[event_type] || ''}`}>
      <div className="post-userpic">
        <UserPicture user={props.createdUser} loading="lazy" className="post-userpic-img" />
      </div>
      <div className="post-body" role="region" aria-label="Post body">
        <div className="post-header">{(notificationTemplates[event_type] || nop)(props)}</div>
      </div>
      <div className="notif-time-date post-body">
        <Icon icon={faClock} /> <TimeDisplay timeStamp={props.date} />
      </div>
    </div>
  );
};

const isFilterActive = (filterName, filter) => filter && filter.includes(filterName);

const Notifications = (props) => (
  <div className="box notifications">
    <ErrorBoundary>
      <div className="box-header-timeline" role="heading">
        Notifications
        {props.isLoading && (
          <span className="notifications-throbber">
            <Throbber />
          </span>
        )}
      </div>
      <div className="filter">
        <div>Show: </div>
        <Link
          className={!props.location.query.filter ? 'active' : ''}
          to={{ pathname: props.location.pathname, query: {} }}
        >
          Everything
        </Link>
        <Link
          className={isFilterActive('mentions', props.location.query.filter) ? 'active' : ''}
          to={{ pathname: props.location.pathname, query: { filter: 'mentions' } }}
        >
          Mentions
        </Link>
        <Link
          className={isFilterActive('subscriptions', props.location.query.filter) ? 'active' : ''}
          to={{ pathname: props.location.pathname, query: { filter: 'subscriptions' } }}
        >
          Subscriptions
        </Link>
        <Link
          className={isFilterActive('groups', props.location.query.filter) ? 'active' : ''}
          to={{ pathname: props.location.pathname, query: { filter: 'groups' } }}
        >
          Groups
        </Link>
        <Link
          className={isFilterActive('directs', props.location.query.filter) ? 'active' : ''}
          to={{ pathname: props.location.pathname, query: { filter: 'directs' } }}
        >
          Direct messages
        </Link>
        <Link
          className={isFilterActive('bans', props.location.query.filter) ? 'active' : ''}
          to={{ pathname: props.location.pathname, query: { filter: 'bans' } }}
        >
          Bans
        </Link>
      </div>
      {props.authenticated ? (
        <PaginatedView routes={props.routes} location={props.location}>
          <div className="notification-list">
            {props.loading
              ? 'Loading'
              : props.events.length > 0
              ? props.events.map(Notification)
              : 'No notifications yet'}
          </div>
        </PaginatedView>
      ) : (
        <div className="alert alert-danger" role="alert">
          You must <SignInLink>sign in</SignInLink> or <Link to="/signup">sign up</Link> before
          visiting this page.
        </div>
      )}
    </ErrorBoundary>
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
        createdUser:
          state.users[event.created_user_id] || state.subscribers[event.created_user_id] || mock,
        affectedUser:
          state.users[event.affected_user_id] || state.subscribers[event.affected_user_id] || mock,
        group: state.users[event.group_id] || mock,
        postAuthor: state.users[event.post_author_id],
        post: state.posts[event.post_id] || mock,
        comment: state.comments[event.comment_id] || mock,
        receiver: state.user,
      };
    }),
  };
};

export default connect(mapStateToProps)(Notifications);

function ReviewRequestLink({ from, group = null }) {
  const managedGroups = useSelector((state) => state.managedGroups);
  const requests = useSelector((state) => state.userRequests);

  const hasRequest = useMemo(() => {
    if (group) {
      const g = managedGroups.find((g) => g.id === group.id);
      return g && g.requests.some((u) => u.id === from.id);
    }
    return requests.some((u) => u.id === from.id);
  }, [requests, managedGroups, group, from]);

  if (!hasRequest) {
    return null;
  }

  return (
    <>
      <Link to="/friends?show=requests" className="btn btn-default btn-sm">
        Review
      </Link>
    </>
  );
}
