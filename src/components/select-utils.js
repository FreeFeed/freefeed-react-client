import {
  // User actions
  subscribe, unsubscribe,
  sendSubscriptionRequest,
  ban, unban,

  // Post actions
  showMoreComments, showMoreLikes,
  addAttachmentResponse, removeAttachment,
  likePost, unlikePost,
  hidePost, unhidePost,
  toggleModeratingComments,
  disableComments, enableComments,
  toggleEditingPost, cancelEditingPost, saveEditingPost,
  deletePost,

  // Comment actions
  toggleCommenting, updateCommentingText, addComment,
  toggleEditingComment, cancelEditingComment, saveEditingComment,
  highlightComment, clearHighlightComment,
  deleteComment
} from '../redux/action-creators';

const MAX_LIKES = 4;

const allFalse = _ => false;

const commentHighlighter = ({commentsHighlights = {}, user, postsViewState}, commentsPostId, commentList) => {
  const {postId, author, arrows, baseCommentId} = commentsHighlights;
  const {comments} = user.frontendPreferences;
  const {omittedComments} = postsViewState[commentsPostId];
  if (!comments.highlightComments) {
    return allFalse;
  }

  if (commentsPostId !== postId) {
    return allFalse;
  }

  const baseIndex = commentList.indexOf(baseCommentId);
  const highlightId = (baseIndex + omittedComments) - arrows;
  const highlightCommentId = commentList[highlightId];

  return (commentId, commentAuthor) => author === commentAuthor.username || highlightCommentId === commentId;
};

export const joinPostData = state => postId => {
  const post = state.posts[postId];
  if (!post) {
    return;
  }
  const user = state.user;

  const attachments = (post.attachments || []).map(attachmentId => state.attachments[attachmentId]);
  const postViewState = state.postsViewState[post.id];
  const omitRepeatedBubbles = state.user.frontendPreferences.comments.omitRepeatedBubbles;
  const highlightComment = commentHighlighter(state, postId, post.comments);
  let comments = (post.comments || []).reduce((_comments, commentId, index) => {
    const comment = state.comments[commentId];
    const commentViewState = state.commentViewState[commentId];
    const placeholderUser = {id: comment.createdBy};
    const author = state.users[comment.createdBy] || placeholderUser;
    if (author === placeholderUser) {
      console.log('We\'ve got comment with unknown author with id', placeholderUser.id);
    }
    const previousAuthor = (_comments[index-1] || {}).user;
    const omitBubble = omitRepeatedBubbles && postViewState.omittedComments === 0 && author === previousAuthor;
    const isEditable = (user.id === comment.createdBy);
    const isDeletable = (user.id === post.createdBy);
    const highlighted = highlightComment(commentId, author);
    return _comments.concat([{ ...comment, ...commentViewState, user: author, isEditable, isDeletable, omitBubble, highlighted }]);
  }, []);

  if (postViewState.omittedComments !== 0) {
    comments = [ comments[0], comments[comments.length - 1] ];
  }

  let usersLikedPost = _.map(post.likes, userId => state.users[userId]);

  if (postViewState.omittedLikes !== 0) {
    usersLikedPost = usersLikedPost.slice(0, MAX_LIKES);
  }

  const placeholderUser = {id: post.createdBy};

  const createdBy = state.users[post.createdBy] || placeholderUser;

  if (createdBy === placeholderUser) {
    console.log('We\'ve got post with unknown author with id', placeholderUser.id);
  }

  const isEditable = (post.createdBy === user.id);

  // Check if the post is a direct message
  const directRecipients = post.postedTo
    .filter((subscriptionId) => {
      let subscriptionType = (state.subscriptions[subscriptionId]||{}).name;
      return (subscriptionType === 'Directs');
    });
  const isDirect = !!directRecipients.length;

  // Get the list of post's recipients
  const recipients = post.postedTo
    .map(subscriptionId => {
      const userId = (state.subscriptions[subscriptionId]||{}).user;
      const subscriptionType = (state.subscriptions[subscriptionId]||{}).name;
      const isDirectToSelf = userId === post.createdBy && subscriptionType === 'Directs';
      return !isDirectToSelf ? userId : false;
    })
    .map(userId => state.subscribers[userId])
    .filter(user => user);

  const allowLinksPreview = state.user.frontendPreferences.allowLinksPreview;

  return {...post,
    createdBy,
    isDirect,
    recipients,
    attachments,
    usersLikedPost,
    comments,
    ...postViewState,
    isEditable,
    allowLinksPreview
  };
};

export function joinCreatePostData(state) {
  const createPostForm = state.createPostForm;
  return {...createPostForm,
    attachments: (createPostForm.attachments || []).map(attachmentId => state.attachments[attachmentId])
  };
}

export function postActions(dispatch) {
  return {
    showMoreComments: (postId) => dispatch(showMoreComments(postId)),
    showMoreLikes: (postId) => dispatch(showMoreLikes(postId)),
    toggleEditingPost: (postId, newValue) => dispatch(toggleEditingPost(postId, newValue)),
    cancelEditingPost: (postId, newValue) => dispatch(cancelEditingPost(postId, newValue)),
    saveEditingPost: (postId, newPost) => dispatch(saveEditingPost(postId, newPost)),
    deletePost: (postId) => dispatch(deletePost(postId)),
    toggleCommenting: (postId) => dispatch(toggleCommenting(postId)),
    updateCommentingText: (postId, commentText) => dispatch(updateCommentingText(postId, commentText)),
    addComment:(postId, commentText) => dispatch(addComment(postId, commentText)),
    likePost: (postId, userId) => dispatch(likePost(postId, userId)),
    unlikePost: (postId, userId) => dispatch(unlikePost(postId, userId)),
    hidePost: (postId) => dispatch(hidePost(postId)),
    unhidePost: (postId) => dispatch(unhidePost(postId)),
    toggleModeratingComments: (postId) => dispatch(toggleModeratingComments(postId)),
    disableComments: (postId) => dispatch(disableComments(postId)),
    enableComments: (postId) => dispatch(enableComments(postId)),
    addAttachmentResponse: (postId, attachments) => dispatch(addAttachmentResponse(postId, attachments)),
    removeAttachment: (postId, attachmentId) => dispatch(removeAttachment(postId, attachmentId)),
    commentEdit: {
      toggleEditingComment: (commentId) => dispatch(toggleEditingComment(commentId)),
      saveEditingComment: (commentId, newValue) => dispatch(saveEditingComment(commentId, newValue)),
      deleteComment: (commentId) => dispatch(deleteComment(commentId)),
      highlightComment: (postId, author, arrows, baseCommentId) => dispatch(highlightComment(postId, author, arrows,  baseCommentId)),
      clearHighlightComment: () => dispatch(clearHighlightComment()),
    },
  };
}

export function userActions(dispatch) {
  return {
    ban: username => dispatch(ban(username)),
    unban: username => dispatch(unban(username)),
    subscribe: username => dispatch(subscribe(username)),
    unsubscribe: username => dispatch(unsubscribe(username)),
    sendSubscriptionRequest: username => dispatch(sendSubscriptionRequest(username))
  };
}
