import React from 'react';
import _ from 'lodash';

import {preventDefault} from '../utils';
import PostComment from './post-comment';
import MoreCommentsWrapper from './more-comments-wrapper';

export default class PostComments extends React.Component {

  openAnsweringComment = (answerText) => {
    const {post, toggleCommenting, updateCommentingText} = this.props;

    if (!post.isCommenting && !post.isSinglePost) {
      toggleCommenting(post.id);
    }
    const text = (post.newCommentText || '');
    const check = new RegExp(`(^|\\s)${_.escapeRegExp(answerText)}\\s*$`);
    if (!text.match(check)) {
      const addSpace = text.length && !text.match(/\s$/);
      updateCommentingText(post.id, `${text}${addSpace ? ' ' : ''}${answerText} `);
    }
  }

  renderAddingComment() {
    const props = this.props;
    return (
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
  }

  renderAddCommentLink() {
    const props = this.props;
    const disabledForOthers = (props.post.commentsDisabled && props.post.isEditable);
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
  }

  renderComment(comment) {
    const props = this.props;
    return (
      <PostComment
        key={comment.id}
        {...comment}
        entryUrl={props.entryUrl}
        openAnsweringComment={this.openAnsweringComment}
        isModeratingComments={props.post.isModeratingComments}
        {...props.commentEdit}
        highlightComment={authorUserName => props.commentEdit.highlightComment(props.post.id, authorUserName)}
        highlightArrowComment={arrows => props.commentEdit.highlightComment(props.post.id, undefined, arrows, comment.id)}/>
    );
  }

  render() {
    const props = this.props;
    const totalComments = props.comments.length + props.post.omittedComments;
    const first = withBackwardNumber(props.comments[0], totalComments);
    const last = withBackwardNumber(props.comments.length > 1 && props.comments[props.comments.length - 1], 1);
    const middle = props.comments.slice(1, props.comments.length - 1).map((c, i) => this.renderComment(withBackwardNumber(c, totalComments - i - 1)));
    const showOmittedNumber = props.post.omittedComments > 0;
    const showMoreComments = () => props.showMoreComments(props.post.id);
    const canAddComment = (!props.post.commentsDisabled || props.post.isEditable);

    return (
      <div className="comments">
        {first ? this.renderComment(first) : false}
        {middle}
        {showOmittedNumber
          ? <MoreCommentsWrapper
              omittedComments={props.post.omittedComments}
              showMoreComments={showMoreComments}
              entryUrl={props.entryUrl}
              isLoading={props.post.isLoadingComments}/>
          : false}
        {last ? this.renderComment(last) : false}
        {canAddComment
          ? (props.post.isCommenting
              ? this.renderAddingComment()
              : this.renderAddCommentLink())
          : false}
      </div>
    );
  }
}

function withBackwardNumber(comment, bn) {
  if (comment) {
    comment.backwardNumber = bn;
  }
  return comment;
}
