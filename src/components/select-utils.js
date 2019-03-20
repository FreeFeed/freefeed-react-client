/*global Raven*/
import { intersectionBy, differenceBy } from 'lodash';

import {
  // User actions
  subscribe, unsubscribe,
  sendSubscriptionRequest,
  ban, unban,

  // Post actions
  showMoreComments, showMoreLikes,
  addAttachmentResponse, removeAttachment, reorderImageAttachments,
  likePost, unlikePost,
  hidePost, unhidePost,
  toggleModeratingComments,
  disableComments, enableComments,
  toggleEditingPost, cancelEditingPost, saveEditingPost,
  deletePost,

  // Comment actions
  toggleCommenting, updateCommentingText, addComment,
  toggleEditingComment, saveEditingComment,
  highlightComment, clearHighlightComment,
  likeComment, unlikeComment, getCommentLikes,
  deleteComment
} from '../redux/action-creators';


const MAX_LIKES = 4;

export const ommitBubblesThreshold = 600 * 1000; // 10 min

const allFalse = () => false;

const commentHighlighter = ({ commentsHighlights, user, postsViewState }, commentsPostId, commentList) => {
  const { postId, author, arrows, baseCommentId } = commentsHighlights;
  const { comments } = user.frontendPreferences;
  const { omittedComments } = postsViewState[commentsPostId];
  if (!comments.highlightComments) {
    return allFalse;
  }

  if (commentsPostId !== postId) {
    return allFalse;
  }

  const baseIndex = commentList.indexOf(baseCommentId);
  const highlightIndex = (baseIndex + omittedComments) - arrows;
  const highlightCommentId = commentList[highlightIndex < baseIndex ? highlightIndex : -1];

  return (commentId, commentAuthor) => (author && author === commentAuthor.username) || highlightCommentId === commentId;
};

const selectCommentLikes = ({ commentLikes, users }, commentId) => {
  if (!commentLikes[commentId]) {
    return { likes: [] };
  }
  const likes = (commentLikes[commentId].likes || []).map(({ userId }) => users[userId]);
  return { ...commentLikes[commentId], likes };
};

const getCommentId = (hash) => {
  if (!hash) {
    return '';
  }
  return hash.replace('#comment-', '');
};

export const joinPostData = (state) => (postId) => {
  const post = state.posts[postId];
  if (!post) {
    return;
  }
  const { user } = state;

  // Get the list of post's recipients
  const recipients = post.postedTo
    .map((subscriptionId) => {
      const userId = (state.subscriptions[subscriptionId] || {}).user;
      const subscriptionType = (state.subscriptions[subscriptionId] || {}).name;
      const isDirectToSelf = userId === post.createdBy && subscriptionType === 'Directs';
      return !isDirectToSelf ? userId : false;
    })
    .map((userId) => state.subscribers[userId])
    .filter((user) => user);

  const isEditable = (post.createdBy === user.id);
  const isModeratable = isEditable || intersectionBy(recipients, state.managedGroups, 'id').length > 0;
  const isFullyRemovable = isEditable || differenceBy(recipients, state.managedGroups, 'id').length === 0;

  const attachments = (post.attachments || []).map((attachmentId) => state.attachments[attachmentId]);
  const postViewState = state.postsViewState[post.id];
  const { omitRepeatedBubbles } = state.user.frontendPreferences.comments;
  const hashedCommentId = getCommentId(state.routing.locationBeforeTransitions.hash);
  const highlightComment = commentHighlighter(state, postId, post.comments);
  let comments = (post.comments || []).reduce((_comments, commentId, index) => {
    const comment = state.comments[commentId];
    if (!comment) {
      return _comments;
    }
    const commentViewState = state.commentViewState[commentId];
    const placeholderUser = { id: comment.createdBy };
    const author = state.users[comment.createdBy] || placeholderUser;
    if (author === placeholderUser) {
      if (typeof Raven !== 'undefined') {
        Raven.captureMessage(`We've got comment with unknown author with id`, { extra: { uid: placeholderUser.id } });
      }
    }
    const previousPost = _comments[index - 1] || { createdBy: null, createdAt: "0" };
    const omitBubble = omitRepeatedBubbles
      && postViewState.omittedComments === 0
      && !comment.hideType
      && !previousPost.hideType
      && comment.createdBy === previousPost.createdBy
      && comment.createdAt - previousPost.createdAt < ommitBubblesThreshold;
    const isEditable = (user.id === comment.createdBy);
    const isDeletable = isModeratable || isModeratable;
    const highlighted = highlightComment(commentId, author);
    const likesList = selectCommentLikes(state, commentId);
    const highlightedFromUrl = commentId === hashedCommentId;
    return _comments.concat([{ ...comment, ...commentViewState, user: author, isEditable, isDeletable, omitBubble, highlighted, likesList, highlightedFromUrl }]);
  }, []);

  if (postViewState.omittedComments !== 0 && comments.length > 2) {
    comments = [comments[0], comments[comments.length - 1]];
  }

  let usersLikedPost = (post.likes || []).map((userId) => state.users[userId]);

  if (postViewState.omittedLikes !== 0) {
    usersLikedPost = usersLikedPost.slice(0, MAX_LIKES);
  }

  const placeholderUser = { id: post.createdBy };

  const createdBy = state.users[post.createdBy] || placeholderUser;

  if (createdBy === placeholderUser) {
    if (typeof Raven !== 'undefined') {
      Raven.captureMessage(`We've got post with unknown author with id`, { extra: { uid: placeholderUser.id } });
    }
  }

  // Check if the post is a direct message
  const directRecipients = post.postedTo
    .filter((subscriptionId) => {
      const subscriptionType = (state.subscriptions[subscriptionId] || {}).name;
      return (subscriptionType === 'Directs');
    });
  const isDirect = !!directRecipients.length;

  const { allowLinksPreview, readMoreStyle } = state.user.frontendPreferences;

  return {
    ...post,
    createdBy,
    isDirect,
    recipients,
    attachments,
    usersLikedPost,
    comments,
    ...postViewState,
    isEditable,
    isModeratable,
    isFullyRemovable,
    allowLinksPreview,
    readMoreStyle,
  };
};

export function joinCreatePostData(state) {
  const { createPostForm } = state;
  return {
    ...createPostForm,
    attachments: (createPostForm.attachments || []).map((attachmentId) => state.attachments[attachmentId])
  };
}

export function postActions(dispatch) {
  return {
    showMoreComments:         (postId) => dispatch(showMoreComments(postId)),
    showMoreLikes:            (postId) => dispatch(showMoreLikes(postId)),
    toggleEditingPost:        (postId) => dispatch(toggleEditingPost(postId)),
    cancelEditingPost:        (postId) => dispatch(cancelEditingPost(postId)),
    saveEditingPost:          (postId, newPost) => dispatch(saveEditingPost(postId, newPost)),
    deletePost:               (postId) => dispatch(deletePost(postId)),
    toggleCommenting:         (postId) => dispatch(toggleCommenting(postId)),
    updateCommentingText:     (postId, commentText) => dispatch(updateCommentingText(postId, commentText)),
    addComment:               (postId, commentText) => dispatch(addComment(postId, commentText)),
    likePost:                 (postId, userId) => dispatch(likePost(postId, userId)),
    unlikePost:               (postId, userId) => dispatch(unlikePost(postId, userId)),
    hidePost:                 (postId) => dispatch(hidePost(postId)),
    unhidePost:               (postId) => dispatch(unhidePost(postId)),
    toggleModeratingComments: (postId) => dispatch(toggleModeratingComments(postId)),
    disableComments:          (postId) => dispatch(disableComments(postId)),
    enableComments:           (postId) => dispatch(enableComments(postId)),
    addAttachmentResponse:    (postId, attachments) => dispatch(addAttachmentResponse(postId, attachments)),
    removeAttachment:         (postId, attachmentId) => dispatch(removeAttachment(postId, attachmentId)),
    reorderImageAttachments:  (postId, attachmentIds) => dispatch(reorderImageAttachments(postId, attachmentIds)),
    commentEdit:              {
      toggleEditingComment:  (commentId) => dispatch(toggleEditingComment(commentId)),
      saveEditingComment:    (commentId, newValue) => dispatch(saveEditingComment(commentId, newValue)),
      deleteComment:         (commentId) => dispatch(deleteComment(commentId)),
      highlightComment:      (postId, author, arrows, baseCommentId) => dispatch(highlightComment(postId, author, arrows, baseCommentId)),
      clearHighlightComment: () => dispatch(clearHighlightComment()),
      likeComment:           (commentId) => dispatch(likeComment(commentId)),
      unlikeComment:         (commentId) => dispatch(unlikeComment(commentId)),
      getCommentLikes:       (commentId) => dispatch(getCommentLikes(commentId)),
    },
  };
}

export function userActions(dispatch) {
  return {
    ban:                     (username) => dispatch(ban(username)),
    unban:                   (username) => dispatch(unban(username)),
    subscribe:               (username) => dispatch(subscribe(username)),
    unsubscribe:             (username) => dispatch(unsubscribe(username)),
    sendSubscriptionRequest: (username) => dispatch(sendSubscriptionRequest(username))
  };
}

/**
 * Returns true/false if this user can (not) accept
 * direct message from us. Returns undefined if this
 * information isn't loaded yet.
 *
 * @param {object} user
 * @param {object} state
 * @returns {boolean|undefined}
 */
export function canAcceptDirects(user, state) {
  if (!user || !user.username) {
    return undefined;
  }

  const { user: me, usersNotFound, directsReceivers } = state;

  if (
    !me.id ||
    user.type === 'group' ||
    me.username === user.username ||
    usersNotFound.includes(user.username)
  ) {
    return false;
  }

  // If user subscribed to us
  if (me.subscribers.some((s) => s.username === user.username)) {
    return true;
  }

  return directsReceivers[user.username];
}

/**
 * Returns privacy flags of non-direct post posted to the given
 * destinations. Destinations should be a current users feed or groups.
 *
 * @param {string[]} destNames
 * @param {object} state
 */
export function destinationsPrivacy(destNames, state) {
  const { user: me, groups } = state;
  const dests = [me, ...Object.values(groups)];
  let isPrivate = true;
  let isProtected = true;
  for (const d of dests) {
    if (destNames.includes(d.username)) {
      isPrivate = isPrivate && d.isPrivate === '1';
      isProtected = isProtected && d.isProtected === '1';
    }
  }
  return { isPrivate, isProtected };
}
