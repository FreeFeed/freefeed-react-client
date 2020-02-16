import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';

import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { preventDefault } from '../utils';
import PostComment from './post-comment';
import MoreCommentsWrapper from './more-comments-wrapper';
import ErrorBoundary from './error-boundary';
import { Icon } from './fontawesome-icons';
import { faCommentPlus } from './fontawesome-custom-icons';
import { Sticky } from './sticky';

const minCommentsToFold = 12;

export default class PostComments extends React.Component {
  static defaultProps = { user: {} };

  addingCommentForm = React.createRef();
  rootEl = React.createRef();

  state = {
    // true if user manually fold expanded comments
    folded: false,
  };

  openAnsweringComment = (answerText) => {
    const { post, toggleCommenting, updateCommentingText } = this.props;

    if (!post.isCommenting && !post.isSinglePost) {
      toggleCommenting(post.id);
    }
    const text = post.newCommentText || '';
    const check = new RegExp(`(^|\\s)${_.escapeRegExp(answerText)}\\s*$`);
    if (!text.match(check)) {
      const addSpace = text.length && !text.match(/\s$/);
      updateCommentingText(post.id, `${text}${addSpace ? ' ' : ''}${answerText} `);
    }
    this.addingCommentForm.current && this.addingCommentForm.current.focus();
  };

  renderAddingComment() {
    const { props } = this;
    return (
      <PostComment
        id={props.post.id}
        postId={props.post.id}
        key={`${props.post.id}-comment-adding`}
        ref={this.addingCommentForm}
        isEditing={true}
        editText={props.post.newCommentText}
        updateCommentingText={props.updateCommentingText}
        saveEditingComment={props.addComment}
        toggleEditingComment={props.toggleCommenting}
        errorString={props.commentError}
        isSaving={props.post.isSavingComment}
        isSinglePost={props.post.isSinglePost}
        currentUser={props.post.user}
        isAddingComment={true}
      />
    );
  }

  renderAddCommentLink() {
    const { props } = this;
    const disabledForOthers =
      props.post.commentsDisabled && (props.post.isEditable || props.post.isModeratable);
    const toggleCommenting = props.post.isSinglePost
      ? () => {}
      : () => props.toggleCommenting(props.post.id);

    if (props.comments.length > 2 && !props.post.omittedComments) {
      return (
        <div className="comment">
          <a className="comment-icon fa-stack" onClick={preventDefault(toggleCommenting)}>
            <Icon icon={faCommentPlus} />
          </a>
          <a className="add-comment-link" onClick={preventDefault(toggleCommenting)}>
            Add comment
          </a>
          {disabledForOthers ? <i> - disabled for others</i> : false}
        </div>
      );
    }

    return false;
  }

  handleHighlightCommentByAuthor = (authorUserName) => {
    this.props.commentEdit.highlightComment(this.props.post.id, authorUserName);
  };

  handleHighlightCommentByArrows = (comment_id, arrows) => {
    this.props.commentEdit.highlightComment(this.props.post.id, undefined, arrows, comment_id);
  };

  renderComment(comment) {
    const { props } = this;
    return (
      <PostComment
        key={comment.id}
        {...comment}
        postId={props.post.id}
        omitBubble={comment.omitBubble && !this.state.folded}
        entryUrl={props.entryUrl}
        isSinglePost={this.props.isSinglePost}
        openAnsweringComment={this.openAnsweringComment}
        isModeratingComments={props.post.isModeratingComments}
        {...props.commentEdit}
        highlightComment={this.handleHighlightCommentByAuthor}
        highlightArrowComment={this.handleHighlightCommentByArrows}
        showMedia={this.props.showMedia}
        readMoreStyle={props.readMoreStyle}
        highlightTerms={props.highlightTerms}
        currentUser={props.post.user}
        showTimestamp={props.showTimestamps}
      />
    );
  }

  fold = () => this.setState({ folded: true });

  showMoreComments = () => {
    if (this.state.folded) {
      this.setState({ folded: false });
    } else {
      this.props.showMoreComments(this.props.post.id);
    }
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    if (this.state.folded && newProps.post.omittedComments > 0) {
      this.setState({ folded: false });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.folded && !prevState.folded) {
      const linkEl = this.rootEl.current.querySelector('.more-comments-wrapper');
      const top = linkEl.getBoundingClientRect().top - 8;
      if (top < 0) {
        window.scrollBy(0, top);
      }
    }
  }

  renderMiddle() {
    const { post, comments, entryUrl, isSinglePost } = this.props;
    const { folded } = this.state;

    const totalComments = comments.length + post.omittedComments;
    const foldedCount = folded ? comments.length - 2 : post.omittedComments;

    const showExpand = !isSinglePost && (folded || post.omittedComments > 0);
    const showFold = !isSinglePost && !showExpand && totalComments >= minCommentsToFold;

    const middleComments = folded
      ? []
      : comments
          .slice(1, comments.length - 1)
          .map((c, i) => this.renderComment(withBackwardNumber(c, totalComments - i - 1)));

    if (showExpand) {
      return [
        <MoreCommentsWrapper
          key={`${post.id}:more-comments`}
          omittedComments={foldedCount}
          showMoreComments={this.showMoreComments}
          entryUrl={entryUrl}
          omittedCommentLikes={post.omittedCommentLikes}
          omittedOwnCommentLikes={post.omittedOwnCommentLikes}
          isLoading={post.isLoadingComments}
        />,
      ];
    }

    if (showFold) {
      return [
        <Sticky
          key={`${post.id}:fold-link`}
          className="fold-comments"
          stickyClassName="fold-comments-sticky"
          stickUntil={middleComments.length}
        >
          <Icon icon={faChevronUp} className="chevron" />
          <a onClick={this.fold}>Fold comments</a>
        </Sticky>,
        ...middleComments,
      ];
    }

    return middleComments;
  }

  renderAddComment() {
    const { post, user } = this.props;
    const canAddComment = !post.commentsDisabled || post.isEditable || post.isModeratable;
    if (!canAddComment) {
      return false;
    }
    if (!user.id) {
      return post.isCommenting ? (
        <div className="comment">
          <span className="comment-icon fa-stack">
            <Icon icon={faCommentPlus} />
          </span>
          <span>
            <Link to="/signin">Sign In</Link> to add comment
          </span>
        </div>
      ) : (
        false
      );
    }
    return post.isCommenting ? this.renderAddingComment() : this.renderAddCommentLink();
  }

  render() {
    const { post, comments } = this.props;
    const totalComments = comments.length + post.omittedComments;
    const first = withBackwardNumber(comments[0], totalComments);
    const last = withBackwardNumber(comments.length > 1 && comments[comments.length - 1], 1);

    return (
      <div className="comments" ref={this.rootEl}>
        <ErrorBoundary>
          {[
            first && this.renderComment(first),
            ...this.renderMiddle(),
            last && this.renderComment(last),
          ]}
          {this.renderAddComment()}
        </ErrorBoundary>
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
