/* global CONFIG */
import { isValidElement, useCallback, useEffect, useMemo } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';

import { uniq } from 'lodash-es';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { getCommentsByIds, getPostsByIds, showMedia } from '../redux/action-creators';
import { READMORE_STYLE_COMPACT } from '../utils/frontend-preferences-options';
import { postReadmoreConfig } from '../utils/readmore-config';
import { Throbber } from './throbber';
import TimeDisplay from './time-display';
import PaginatedView from './paginated-view';
import ErrorBoundary from './error-boundary';
import UserName from './user-name';
import { SignInLink } from './sign-in-link';
import { UserPicture } from './user-picture';
import PieceOfText from './piece-of-text';
import Expandable from './expandable';
import { Icon } from './fontawesome-icons';
import { useBool } from './hooks/bool';

const getAuthorName = ({ postAuthor, createdUser, group }) => {
  if (group && group.username) {
    return group.username;
  }
  if (postAuthor && postAuthor.username) {
    return postAuthor.username;
  }
  return createdUser.username;
};

const generatePostUrl = ({ post_id, shortPostId, ...event }) =>
  `/${getAuthorName(event)}/${shortPostId ?? post_id}`;
const generateCommentUrl = ({ post_id, comment_id, shortPostId, shortCommentId, ...event }) =>
  `/${getAuthorName(event)}/${shortPostId ?? post_id}#${
    shortCommentId ? shortCommentId : `comment-${comment_id}`
  }`;
const postLink = (
  event,
  { isDirect = false, fallback = isDirect ? 'deleted direct message' : 'deleted post' } = {},
) => {
  let author = event.post_id
    ? UserLink({
        user: event.postAuthor,
        recipient: event.receiver,
        subject: event.createdUser,
        possessive: true,
      })
    : null;
  if (isValidElement(author)) {
    author = <>the {author}</>;
  }
  return event.post_id ? (
    <>
      {author} <Link to={generatePostUrl(event)}>{isDirect ? 'direct message' : 'post'}</Link>
    </>
  ) : (
    fallback
  );
};

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

const UserLink = ({
  user,
  recipient = null,
  subject = null,
  atStart = false,
  possessive = false,
  fallback = 'Some user',
}) => {
  if (!user) {
    return atStart ? fallback : fallback.toLowerCase();
  }
  if (user.id === recipient?.id) {
    if (possessive) {
      return atStart ? 'Your' : 'your';
    }
    return atStart ? 'You' : 'you';
  }
  if (user.id === subject?.id) {
    if (possessive) {
      return atStart ? 'Their' : 'their';
    }
    return atStart ? 'They' : 'they';
  }
  const tail = possessive ? (user.username.endsWith('s') ? '\u2019' : '\u2019s') : '';
  return (
    <>
      <UserName user={user}>@{user.username}</UserName>
      {tail}
    </>
  );
};

const postInGroup = (event) => (
  <>
    {postLink(event)}
    {event.group && (
      <>
        {' '}
        [in <UserLink user={event.group} />]
      </>
    )}
  </>
);

const notificationTemplates = {
  subscription_request_revoked: (event) => (
    <>
      <UserLink div user={event.createdUser} /> revoked subscription request to you
    </>
  ),

  mention_in_post: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> mentioned you in {postInGroup(event)}
    </>
  ),
  mention_in_comment: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> mentioned you in a{' '}
      {commentLink(event, 'comment')} to {postInGroup(event)}
    </>
  ),
  mention_comment_to: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> {commentLink(event, 'replied')} in{' '}
      {postInGroup(event)}
    </>
  ),
  backlink_in_comment: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> mentioned your {backlinkLink(event)} in a{' '}
      {commentLink(event, 'comment')} to {postInGroup(event)}
    </>
  ),
  backlink_in_post: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> mentioned your {backlinkLink(event)} in{' '}
      {postInGroup(event)}
    </>
  ),
  banned_user: (event) => (
    <>
      You blocked <UserLink user={event.affectedUser} />
    </>
  ),
  unbanned_user: (event) => (
    <>
      You unblocked <UserLink user={event.affectedUser} />
    </>
  ),
  subscription_requested: (event) => (
    <>
      <UserName atStart user={event.createdUser}>
        @{event.createdUser.username}
      </UserName>{' '}
      sent you a subscription request <ReviewRequestLink from={event.createdUser} />
    </>
  ),
  user_subscribed: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> subscribed to your feed
    </>
  ),
  user_unsubscribed: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> unsubscribed from your feed
    </>
  ),
  subscription_request_approved: (event) => (
    <>
      Your subscription request to <UserLink user={event.createdUser} /> was approved
    </>
  ),
  subscription_request_rejected: (event) => (
    <>
      Your subscription request to <UserLink user={event.createdUser} /> was rejected
    </>
  ),
  group_created: (event) => (
    <>
      You created a group <UserLink user={event.group} />
    </>
  ),
  group_subscription_requested: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> sent a request to join{' '}
      <UserLink user={event.group} /> that you admin{' '}
      <ReviewRequestLink from={event.createdUser} group={event.group} />
    </>
  ),
  group_admin_promoted: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> promoted <UserLink user={event.affectedUser} />{' '}
      to admin in the group <UserLink user={event.group} />
    </>
  ),
  group_admin_demoted: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> revoked admin privileges from{' '}
      <UserLink user={event.affectedUser} /> in group <UserLink user={event.group} />
    </>
  ),
  managed_group_subscription_approved: (event) => (
    <>
      <UserLink atStart user={event.affectedUser} /> request to join <UserLink user={event.group} />{' '}
      was approved by <UserLink user={event.createdUser} />
    </>
  ),
  managed_group_subscription_rejected: (event) => (
    <>
      <UserLink atStart user={event.affectedUser} /> request to join <UserLink user={event.group} />{' '}
      was rejected by <UserLink user={event.createdUser} />
    </>
  ),
  group_subscription_approved: (event) => (
    <>
      Your request to join group <UserLink user={event.group} /> was approved
    </>
  ),
  group_subscription_request_revoked: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> revoked subscription request to{' '}
      <UserLink user={event.group} />
    </>
  ),
  direct_left: (event) =>
    event.created_user_id === event.receiver.id ? (
      <>
        You left a direct message created by <UserLink user={event.postAuthor} />
      </>
    ) : event.post_author_id === event.receiver.id ? (
      <>
        <UserLink atStart user={event.createdUser} /> left a {directPostLink(event)} created by you
      </>
    ) : (
      <>
        <UserLink atStart user={event.createdUser} /> left a {directPostLink(event)} created by{' '}
        <UserLink user={event.postAuthor} />
      </>
    ),
  direct: (event) => (
    <>
      <UserLink user={event.createdUser} atStart /> sent you a {directPostLink(event)}
    </>
  ),
  direct_comment: (event) => (
    <>
      <UserLink user={event.createdUser} /> added a {commentLink(event, 'new comment')} to{' '}
      {postLink(event, { isDirect: true })}
    </>
  ),
  post_comment: (event) => (
    <>
      <UserLink user={event.createdUser} /> added a {commentLink(event, 'new comment')} to{' '}
      {postLink(event)}
    </>
  ),
  post_comments_subscribe: (event) => <>You have subscribed to comments on {postLink(event)}</>,
  post_comments_unsubscribe: (event) => (
    <>You have unsubscribed from comments on {postLink(event)}</>
  ),
  group_subscription_rejected: (event) => (
    <>
      Your request to join group <UserLink user={event.group} /> was rejected
    </>
  ),
  group_subscribed: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> subscribed to <UserLink user={event.group} />
    </>
  ),
  group_unsubscribed: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> unsubscribed from{' '}
      <UserLink user={event.group} />
    </>
  ),
  invitation_used: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> has joined {CONFIG.siteTitle} using your
      invitation
    </>
  ),

  banned_by_user: () => `Notification shouldn't be shown`,
  unbanned_by_user: () => `Notification shouldn't be shown`,

  comment_moderated: (event) => (
    <>
      <UserLink atStart user={event.createdUser} fallback="Group admin" /> has deleted your comment
      to {postInGroup(event)}
    </>
  ),
  comment_moderated_by_another_admin: (event) => (
    <>
      <UserLink atStart user={event.createdUser} fallback="Group admin" /> has removed a comment
      from <UserLink user={event.affectedUser} /> to {postInGroup(event)}
    </>
  ),
  post_moderated: (event) => (
    <>
      <UserLink atStart user={event.createdUser} fallback="Group admin" /> has removed{' '}
      {postLink(event, { fallback: 'your post' })}
      {event.group_id && (
        <>
          {' '}
          from the group <UserLink user={event.group} />
        </>
      )}
    </>
  ),
  post_moderated_by_another_admin: (event) => (
    <>
      <UserLink atStart user={event.createdUser} /> has removed{' '}
      {postLink(event, { fallback: 'the post' })} from <UserLink user={event.affectedUser} />
      {event.group_id && (
        <>
          {' '}
          from the group <UserLink user={event.group} />
        </>
      )}
    </>
  ),

  blocked_in_group: (event) => (
    <>
      <UserLink
        atStart
        user={event.createdUser}
        recipient={event.receiver}
        fallback="Group admin"
      />{' '}
      {event.event_type === 'blocked_in_group' ? 'blocked' : 'unblocked'}{' '}
      <UserLink user={event.affectedUser} recipient={event.receiver} /> in group{' '}
      <UserLink user={event.group} />
    </>
  ),

  bans_in_group_disabled: (event) => (
    <>
      <UserLink atStart user={event.createdUser} recipient={event.receiver} /> disabled bans{' '}
      {event.recipient_user_id === event.created_user_id ? 'for yourself' : 'for you'} in group{' '}
      <UserLink user={event.group} />
    </>
  ),

  bans_in_group_enabled: (event) => (
    <>
      <UserLink atStart user={event.createdUser} recipient={event.receiver} /> enabled bans{' '}
      {event.recipient_user_id === event.created_user_id ? 'for yourself' : 'for you'} in group{' '}
      <UserLink user={event.group} />
    </>
  ),
};

notificationTemplates.unblocked_in_group = notificationTemplates.blocked_in_group;

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

function userPictureSource(event) {
  if (
    ['bans_in_group_disabled', 'bans_in_group_enabled', 'group_created'].includes(
      event.event_type,
    ) &&
    event.recipient_user_id === event.created_user_id
  ) {
    return event.group;
  }
  if (['banned_user', 'unbanned_user'].includes(event.event_type)) {
    return event.affectedUser;
  }
  if (['post_comments_subscribe', 'post_comments_unsubscribe'].includes(event.event_type)) {
    return [event.postAuthor, event.receiver].find(Boolean);
  }
  return [
    event.createdUser,
    event.group,
    event.postAuthor,
    event.affectedUser,
    event.receiver,
  ].find(Boolean);
}

function mainEventLink(event) {
  if (event.comment_id) {
    return generateCommentUrl(event);
  } else if (event.post_id) {
    return generatePostUrl(event);
  }
  return null;
}

function getContentSource(event) {
  switch (event.event_type) {
    case 'mention_in_comment':
    case 'mention_comment_to':
    case 'backlink_in_comment':
    case 'direct_comment':
    case 'post_comment':
      return 'comment';
  }
  if (event.comment_id) {
    return 'comment';
  } else if (event.post_id) {
    return 'post';
  }
  return null;
}

function Notification({ event }) {
  const dispatch = useDispatch();
  const allPosts = useSelector((state) => state.posts);
  const allComments = useSelector((state) => state.comments);
  const readMoreStyle = useSelector((state) => state.user.frontendPreferences.readMoreStyle);
  const doShowMedia = useCallback((...args) => dispatch(showMedia(...args)), [dispatch]);
  const [absTimestamps, toggleAbsTimestamps] = useBool(false);
  const contentSource = getContentSource(event);
  const content =
    contentSource === 'post'
      ? allPosts[event.post_id]?.body
      : contentSource === 'comment'
        ? allComments[event.comment_id]?.body
        : null;
  const eventWithShortIds = useMemo(
    () => ({
      ...event,
      shortPostId: allPosts[event.post_id]?.shortId,
      shortCommentId: allComments[event.comment_id]?.shortId,
    }),
    [allComments, allPosts, event],
  );
  const mainLink = mainEventLink(eventWithShortIds);
  return (
    <div className={`single-notification ${notificationClasses[event.event_type] || ''}`}>
      <div className="single-notification__picture">
        <UserPicture user={userPictureSource(event)} size={40} loading="lazy" />
      </div>
      <div className="single-notification__headline">
        {(notificationTemplates[event.event_type] || nop)(eventWithShortIds)}
      </div>
      <div className="single-notification__content">
        {content ? (
          <Expandable
            expanded={readMoreStyle === READMORE_STYLE_COMPACT}
            config={postReadmoreConfig}
          >
            <PieceOfText text={content} readMoreStyle={readMoreStyle} showMedia={doShowMedia} />
          </Expandable>
        ) : contentSource ? (
          <em>Text not available</em>
        ) : null}
      </div>
      <div className="single-notification__date">
        <Icon
          icon={faBell}
          className="single-notification__date-icon"
          onClick={toggleAbsTimestamps}
        />
        {mainLink ? (
          <Link to={mainLink}>
            <TimeDisplay timeStamp={event.date} absolute={absTimestamps || null} />
          </Link>
        ) : (
          <TimeDisplay timeStamp={event.date} absolute={absTimestamps || null} />
        )}
      </div>
    </div>
  );
}

const isFilterActive = (filterName, filter) => filter && filter.includes(filterName);

function Notifications(props) {
  const dispatch = useDispatch();
  const postIds = useMemo(
    () =>
      uniq(props.events.map((event) => !event.comment_id && event.post_id).filter(Boolean)).sort(),
    [props.events],
  );
  const commentIds = useMemo(
    () => uniq(props.events.map((event) => event.comment_id).filter(Boolean)).sort(),
    [props.events],
  );

  useEffect(() => {
    postIds.length > 0 && dispatch(getPostsByIds(postIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, postIds.join(',')]);

  useEffect(() => {
    commentIds.length > 0 && dispatch(getCommentsByIds(commentIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, commentIds.join(',')]);

  return (
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
          <EventGroupLink location={props.location}>Everything</EventGroupLink>
          <EventGroupLink location={props.location} name="mentions">
            Mentions
          </EventGroupLink>
          <EventGroupLink location={props.location} name="comments">
            Comments
          </EventGroupLink>
          <EventGroupLink location={props.location} name="subscriptions">
            Subscriptions
          </EventGroupLink>
          <EventGroupLink location={props.location} name="groups">
            Groups
          </EventGroupLink>
          <EventGroupLink location={props.location} name="directs">
            Direct messages
          </EventGroupLink>
          <EventGroupLink location={props.location} name="bans">
            Bans
          </EventGroupLink>
        </div>
        {props.authenticated ? (
          <PaginatedView routes={props.routes} location={props.location}>
            <div className="notification-list">
              {props.loading
                ? 'Loading'
                : props.events.length > 0
                  ? props.events.map((e) => <Notification event={e} key={e.id} />)
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
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.notifications.loading,
    filter: state.routing.locationBeforeTransitions.query.filter,
    authenticated: state.authenticated,
    events: (state.notifications.events || []).map((event) => {
      return {
        ...event,
        createdUser:
          state.users[event.created_user_id] || state.subscribers[event.created_user_id] || null,
        affectedUser:
          state.users[event.affected_user_id] || state.subscribers[event.affected_user_id] || null,
        group: state.users[event.group_id] || null,
        postAuthor: state.users[event.post_author_id] || null,
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

function EventGroupLink({ location: { pathname, query }, name = null, children }) {
  const isActive = name ? isFilterActive(name, query.filter) : !query.filter;
  const to = useMemo(() => ({ pathname, query: name ? { filter: name } : {} }), [pathname, name]);
  return (
    <Link className={isActive ? 'active' : ''} to={to}>
      {children}
    </Link>
  );
}
