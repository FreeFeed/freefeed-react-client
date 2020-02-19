import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { preventDefault, confirmFirst } from '../utils';
import { READMORE_STYLE_COMPACT, COMMENT_DELETED } from '../utils/frontend-preferences-options';
import { commentReadmoreConfig } from '../utils/readmore-config';
import { defaultCommentState } from '../redux/reducers/comment-edit';

import PieceOfText from './piece-of-text';
import Expandable from './expandable';
import UserName from './user-name';
import TimeDisplay from './time-display';
import CommentIcon, { JustCommentIcon } from './comment-icon';
import { CommentEditForm } from './comment-edit-form';

class PostComment extends React.Component {
  commentContainer;
  commentForm;
  commentsAreHighlighted;

  constructor(props) {
    super(props);

    this.state = { isAuthorHovered: false };
    this.commentForm = null;
    this.commentsAreHighlighted = false;
  }

  scrollToComment = () => {
    if (this.commentContainer) {
      const rect = this.commentContainer.getBoundingClientRect();
      const middleScreenPosition =
        window.pageYOffset + (rect.top + rect.bottom) / 2 - window.innerHeight / 2;
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        window.scrollTo(0, middleScreenPosition);
      }
    }
  };

  componentDidMount() {
    if (this.props.highlightedFromUrl) {
      setTimeout(this.scrollToComment, 0);
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.highlightedFromUrl && this.props.highlightedFromUrl) {
      setTimeout(this.scrollToComment, 0);
    }
  }

  componentWillUnmount() {
    if (this.enterTimeout) {
      clearTimeout(this.enterTimeout);
    }
    if (this.commentsAreHighlighted) {
      this.props.clearHighlightComment();
      this.commentsAreHighlighted = false;
    }
  }

  reply = () => {
    this.props.openAnsweringComment(_.repeat('^', this.props.backwardNumber));
  };

  mention = () => {
    this.props.openAnsweringComment(`@${this.props.user.username}`);
  };

  saveComment = (text) => this.props.saveEditingComment(this.props.id, text);

  insertText(insertion) {
    this.commentForm && this.commentForm.insertText(insertion);
  }

  toggleLike = () => {
    return this.props.hasOwnLike
      ? this.props.unlikeComment(this.props.id)
      : this.props.likeComment(this.props.id);
  };

  getCommentLikes = () => {
    this.props.getCommentLikes(this.props.id);
  };

  registerCommentContainer = (el) => {
    this.commentContainer = el;
  };

  registerCommentForm = (el) => {
    this.commentForm = el;
  };

  handleEditOrCancel = preventDefault(() => this.props.toggleEditingComment(this.props.id));

  handleDeleteComment = confirmFirst(() => this.props.deleteComment(this.props.id));

  handleHoverOnUsername = (username) => {
    this.props.highlightComment(username);
    this.commentsAreHighlighted = true;
  };

  handleStopHighlighting = () => {
    this.props.clearHighlightComment();
    this.commentsAreHighlighted = false;
  };

  handleHoverOverArrow = (arrows) => {
    this.props.highlightArrowComment(this.props.id, arrows);
    this.commentsAreHighlighted = true;
  };

  renderBody() {
    if (this.props.hideType) {
      const isDeletable = this.props.isDeletable && this.props.hideType !== COMMENT_DELETED;
      return (
        <div className="comment-body">
          <span className="comment-text">{this.props.body}</span>
          {isDeletable && this.props.isModeratingComments ? (
            <span>
              {' - '}(<a onClick={this.handleDeleteComment}>delete</a>)
            </span>
          ) : (
            false
          )}
        </div>
      );
    }

    if (this.props.isEditing) {
      return (
        <CommentEditForm
          ref={this.registerCommentForm}
          initialText={this.props.isAddingComment ? this.props.editText : this.props.body}
          isPersistent={this.props.isSinglePost && this.props.isAddingComment}
          onSubmit={this.saveComment}
          onCancel={this.handleEditOrCancel}
          submitStatus={this.props.saveStatus}
        />
      );
    }

    const authorAndButtons = (
      <span>
        {' -'}&nbsp;
        <UserName
          user={this.props.user}
          userHover={{
            hover: this.handleHoverOnUsername,
            leave: this.handleStopHighlighting,
          }}
        />
        {this.props.isEditable ? (
          <span>
            {' '}
            (<a onClick={this.handleEditOrCancel}>edit</a>
            &nbsp;|&nbsp;
            <a onClick={this.handleDeleteComment}>delete</a>)
          </span>
        ) : this.props.isDeletable && this.props.isModeratingComments ? (
          <span>
            {' '}
            (<a onClick={this.handleDeleteComment}>delete</a>)
          </span>
        ) : (
          false
        )}
      </span>
    );

    return (
      <div className="comment-body">
        <Expandable
          expanded={
            this.props.readMoreStyle === READMORE_STYLE_COMPACT ||
            this.props.isSinglePost ||
            this.props.isExpanded
          }
          bonusInfo={authorAndButtons}
          config={commentReadmoreConfig}
        >
          <PieceOfText
            text={this.props.body}
            readMoreStyle={this.props.readMoreStyle}
            highlightTerms={this.props.highlightTerms}
            userHover={{
              hover: this.handleHoverOnUsername,
              leave: this.handleStopHighlighting,
            }}
            arrowHover={{
              hover: this.handleHoverOverArrow,
              leave: this.handleStopHighlighting,
            }}
            showMedia={this.props.showMedia}
          />
          {authorAndButtons}
          {this.props.showTimestamp ? (
            <span className="comment-timestamp">
              {' - '}
              <Link to={`${this.props.entryUrl}#comment-${this.props.id}`}>
                <TimeDisplay timeStamp={+this.props.createdAt} showAbsTime />
              </Link>
            </span>
          ) : (
            false
          )}
        </Expandable>
      </div>
    );
  }

  renderCommentIcon() {
    const { props } = this;
    if (props.hideType) {
      return false;
    }

    if (props.isEditing) {
      return <JustCommentIcon />;
    }

    return (
      <CommentIcon
        id={props.id}
        postId={props.postId}
        omitBubble={props.omitBubble}
        reply={this.reply}
        mention={this.mention}
        entryUrl={this.props.entryUrl}
      />
    );
  }

  render() {
    const className = classnames({
      comment: true,
      highlighted: this.props.highlighted,
      'omit-bubble': this.props.omitBubble,
      'is-hidden': !!this.props.hideType,
      'highlight-from-url': this.props.highlightedFromUrl,
      'my-comment':
        this.props.currentUser &&
        this.props.user &&
        this.props.currentUser.id === this.props.user.id,
    });

    return (
      <div
        className={className}
        data-author={this.props.user && !this.props.isEditing ? this.props.user.username : ''}
        ref={this.registerCommentContainer}
      >
        {this.renderCommentIcon()}
        {this.renderBody()}
      </div>
    );
  }
}

function selectState(state, ownProps) {
  const editState = state.commentEditState[ownProps.id] || defaultCommentState;
  return { ...editState, isEditing: ownProps.isEditing || editState.isEditing };
}

export default connect(selectState, null, null, { forwardRef: true })(PostComment);
