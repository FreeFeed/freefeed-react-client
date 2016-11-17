import React from 'react';
import {StickyContainer, Sticky} from 'react-sticky';
import _ from 'lodash';

import {preventDefault} from '../utils';
import PostComment from './post-comment';
import MoreCommentsWrapper from './more-comments-wrapper';

const minCommentsToFold = 12;

export default class PostComments extends React.Component {

  addingCommentForm = null;
  root = null;

  setRoot = el => this.root = el;

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
    if (this.addingCommentForm) {
      this.addingCommentForm.focus();
    }
  }

  renderAddingComment() {
    const props = this.props;
    return (
      <PostComment
        id={props.post.id}
        key={`${props.post.id}-comment-adding`}
        ref={(el) => this.addingCommentForm = el}
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
        omitBubble={comment.omitBubble}
        entryUrl={props.entryUrl}
        openAnsweringComment={this.openAnsweringComment}
        isModeratingComments={props.post.isModeratingComments}
        {...props.commentEdit}
        highlightComment={authorUserName => props.commentEdit.highlightComment(props.post.id, authorUserName)}
        highlightArrowComment={arrows => props.commentEdit.highlightComment(props.post.id, undefined, arrows, comment.id)}
        highlightTerms={props.highlightTerms}/>
    );
  }

  foldComments = () => this.props.foldComments(this.props.post.id);

  showMoreComments = () => {
    const {
      post: {id, totalComments},
      comments,
      showMoreComments,
      unfoldComments,
    } = this.props;

    if (comments.length !== totalComments) {
      showMoreComments(id);
    } else {
      unfoldComments(id);
    }
  }

  renderMiddle() {
    const {post, comments, entryUrl, isSinglePost} = this.props;

    const middleComments = comments.slice(1, comments.length - 1).map((c, i) => this.renderComment(withBackwardNumber(c, post.totalComments - i - 1)));

    if (isSinglePost) {
      return middleComments;
    }

    const showExpand = post.omittedComments > 0;
    const showFold = !showExpand && post.totalComments >= minCommentsToFold;

    if (showExpand) {
      return (
        <MoreCommentsWrapper
          omittedComments={post.omittedComments}
          showMoreComments={this.showMoreComments}
          entryUrl={entryUrl}
          isLoading={post.isLoadingComments}/>
      );
    }

    if (showFold) {
      return (
        <StickyContainer>
          <Sticky stickyClassName="fold-comments-sticky" className="fold-comments">
            <i className="fa fa-chevron-up"/>
            <a onClick={this.foldComments}>Fold comments</a>
          </Sticky>
          {middleComments}
        </StickyContainer>
      );
    }

    return middleComments;
  }

  componentDidUpdate(prevProps) {
    // if comments was folded, scroll page to the 'more' link
    if (prevProps.post.omittedComments === 0 && this.props.post.omittedComments !== 0) {
      const linkEl = this.root.querySelector('.more-comments-wrapper');
      const top = linkEl.getBoundingClientRect().top - 8;
      if (top < 0) {
        window.scrollBy(0, top);
      }
    }
  }

  render() {
    const {post, comments} = this.props;
    const totalComments = comments.length + post.omittedComments;
    const first = withBackwardNumber(comments[0], totalComments);
    const last = withBackwardNumber(comments.length > 1 && comments[comments.length - 1], 1);
    const canAddComment = (!post.commentsDisabled || post.isEditable);

    return (
      <div className="comments" ref={this.setRoot}>
        {first ? this.renderComment(first) : false}
        {this.renderMiddle()}
        {last ? this.renderComment(last) : false}
        {canAddComment
          ? (post.isCommenting
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
