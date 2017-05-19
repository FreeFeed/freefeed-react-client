import React from 'react';
import ReactDOM from 'react-dom';
import {StickyContainer, Sticky} from 'react-sticky';
import _ from 'lodash';

import {preventDefault} from '../utils';
import PostComment from './post-comment';
import MoreCommentsWrapper from './more-comments-wrapper';

const minCommentsToFold = 12;

export default class PostComments extends React.Component {

  constructor(props) {
    super(props);
    this.addingCommentForm = null;
    this.rootEl = null;
    this.state = {
      // true if user manually fold expanded comments
      folded: false,
    };
  }

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

  renderAddingComment(last) {
    const props = this.props;
    return (
      <PostComment
        id={props.post.id}
        key={`${props.post.id}-comment-adding`}
        ref={(el) => this.addingCommentForm = el}
        isEditing={true}
        editText={props.post.newCommentText}
        updateCommentingText={props.updateCommentingText}
        saveEditingComment={props.addComment}
        toggleEditingComment={props.toggleCommenting}
        errorString={props.commentError}
        highlightArrowComment={arrows => props.commentEdit.highlightComment(props.post.id, undefined, arrows, last.id)}
        clearHighlightComment={props.commentEdit.clearHighlightComment}
        isSaving={props.post.isSavingComment}/>
    );
  }

  renderAddCommentLink() {
    const props = this.props;
    const disabledForOthers = (props.post.commentsDisabled && props.post.isEditable);
    const toggleCommenting = props.post.isSinglePost ? () => {} : () => props.toggleCommenting(props.post.id);

    if (props.comments.length > 2 && !props.post.omittedComments) {
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
        omitBubble={comment.omitBubble && !this.state.folded}
        entryUrl={props.entryUrl}
        isSinglePost={this.props.isSinglePost}
        openAnsweringComment={this.openAnsweringComment}
        isModeratingComments={props.post.isModeratingComments}
        {...props.commentEdit}
        highlightComment={authorUserName => props.commentEdit.highlightComment(props.post.id, authorUserName)}
        highlightArrowComment={arrows => props.commentEdit.highlightComment(props.post.id, undefined, arrows, comment.id)}
        readMoreStyle={props.readMoreStyle}
        highlightTerms={props.highlightTerms}/>
    );
  }

  fold = () => this.setState({folded: true})

  showMoreComments = () => {
    if (this.state.folded) {
      this.setState({folded: false});
    } else {
      this.props.showMoreComments(this.props.post.id);
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.state.folded && newProps.post.omittedComments > 0) {
      this.setState({folded: false});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.folded && !prevState.folded) {
      const linkEl = this.rootEl.querySelector('.more-comments-wrapper');
      const top = linkEl.getBoundingClientRect().top - 8;
      if (top < 0) {
        window.scrollBy(0, top);
      }
    }
  }

  renderMiddle() {
    const {post, comments, entryUrl, isSinglePost} = this.props;
    const {folded} = this.state;

    const totalComments = comments.length + post.omittedComments;
    const foldedCount = folded ? comments.length - 2 : post.omittedComments;

    const showExpand = !isSinglePost && (folded || post.omittedComments > 0);
    const showFold = !isSinglePost && !showExpand && totalComments >= minCommentsToFold;

    const middleComments = folded ? [] : comments.slice(1, comments.length - 1).map((c, i) => this.renderComment(withBackwardNumber(c, totalComments - i - 1)));

    if (showExpand) {
      return (
        <MoreCommentsWrapper
          omittedComments={foldedCount}
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
            <a onClick={this.fold}>Fold comments</a>
          </Sticky>
          {middleComments}
        </StickyContainer>
      );
    }

    return middleComments;
  }

  render() {
    const {post, comments} = this.props;
    const totalComments = comments.length + post.omittedComments;
    const first = withBackwardNumber(comments[0], totalComments);
    const last = withBackwardNumber(comments.length > 1 && comments[comments.length - 1], 1);
    const canAddComment = (!!post.user && (!post.commentsDisabled || post.isEditable));

    return (
      <div className="comments" ref={(el) => this.rootEl = el ? ReactDOM.findDOMNode(el) : null}>
        {first ? this.renderComment(first) : false}
        {this.renderMiddle()}
        {last ? this.renderComment(last) : false}
        {canAddComment
          ? (post.isCommenting
              ? this.renderAddingComment(last)
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
