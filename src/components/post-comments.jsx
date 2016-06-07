import React from 'react';
import _ from 'lodash';

import PostComment from './post-comment';
import MoreCommentsWrapper from './more-comments-wrapper';
import {preventDefault} from '../utils';

const renderComment = (entryUrl, openAnsweringComment, isModeratingComments, commentEdit, postId) => comment => (
  <PostComment
    key={comment.id}
    {...comment}
    entryUrl={entryUrl}
    openAnsweringComment={openAnsweringComment}
    isModeratingComments={isModeratingComments}
    {...commentEdit}
    highlightComment={authorUserName => commentEdit.highlightComment(postId, authorUserName)}
    highlightArrowComment={arrows => commentEdit.highlightComment(postId, undefined, arrows, comment.id)}/>
);

const renderAddingComment = props => (
  <PostComment
    id={props.post.id}
    key={`${props.post.id}-comment-adding`}
    isEditing={true}
    isSinglePost={props.post.isSinglePost}
    editText={props.post.newCommentText}
    updateCommentingText={props.updateCommentingText}
    saveEditingComment={props.addComment}
    toggleEditingComment={props.toggleCommenting}
    errorString={props.commentError}
    isSaving={props.post.isSavingComment}/>
);

const renderAddCommentLink = (props, disabledForOthers) => {
  const toggleCommenting = props.post.isSinglePost ? () => {} : () => props.toggleCommenting(props.post.id);

  if (props.comments.length > 2 && !props.post.omittedComments /* TODO: && user_is_signed_in */) {
    return (
      <div className="comment">
        <a className="comment-icon fa-stack fa-1x" onClick={preventDefault(toggleCommenting)}>
          <i className="fa fa-comment-o fa-stack-1x"></i>
          <i className="fa fa-square fa-inverse fa-stack-1x"></i>
          <i className="fa fa-plus fa-stack-1x"></i>
        </a>
        <a className="add-comment-link" onClick={preventDefault(toggleCommenting)}>Add comment</a>
        {disabledForOthers
          ? <i> - disabled for others</i>
          : false}
      </div>
    );
  }

  return false;
};

export default (props) => {

  const openAnsweringComment = (answerText) => {
    if (!props.post.isCommenting && !props.post.isSinglePost) {
      props.toggleCommenting(props.post.id);
    }

    const text = (props.post.newCommentText || '');
    const check = new RegExp(`(^|\\s)${_.escapeRegExp(answerText)}\\s*$`);
    if (!text.match(check)) {
      const addSpace = text.length && !text.match(/\s$/);
      props.updateCommentingText(props.post.id, `${text}${addSpace ? ' ' : ''}${answerText} `);
    }
  };

  const commentMapper = renderComment(props.entryUrl, openAnsweringComment, props.post.isModeratingComments, props.commentEdit, props.post.id);
  const totalComments = props.comments.length + props.post.omittedComments; 
  const first = withBackwardNumber(props.comments[0], totalComments);
  const last = withBackwardNumber(props.comments.length > 1 && props.comments[props.comments.length - 1], 1);
  const middle = props.comments.slice(1, props.comments.length - 1).map((c, i) => commentMapper(withBackwardNumber(c, totalComments - i - 1)));
  const showOmittedNumber = props.post.omittedComments > 0;
  const showMoreComments = () => props.showMoreComments(props.post.id);
  const canAddComment = (!props.post.commentsDisabled || props.post.isEditable);
  const disabledForOthers = (props.post.commentsDisabled && props.post.isEditable);

  return (
    <div className="comments">
      {first ? commentMapper(first) : false}
      {middle}
      {showOmittedNumber
        ? <MoreCommentsWrapper
            omittedComments={props.post.omittedComments}
            showMoreComments={showMoreComments}
            entryUrl={props.entryUrl}
            isLoading={props.post.isLoadingComments}/>
        : false}
      {last ? commentMapper(last) : false}
      {canAddComment
        ? (props.post.isCommenting
            ? renderAddingComment(props)
            : renderAddCommentLink(props, disabledForOthers))
        : false}
    </div>
  );
};

function withBackwardNumber(comment, bn) {
  if (comment) {
    comment.backwardNumber = bn;
  }
  return comment; 
}