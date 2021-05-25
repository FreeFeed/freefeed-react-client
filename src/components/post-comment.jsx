/* global CONFIG */
import { Component } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { preventDefault, confirmFirst } from '../utils';
import {
  READMORE_STYLE_COMPACT,
  COMMENT_HIDDEN_BANNED,
  COMMENT_VISIBLE,
} from '../utils/frontend-preferences-options';
import { commentReadmoreConfig } from '../utils/readmore-config';
import { defaultCommentState } from '../redux/reducers/comment-edit';

import { safeScrollTo } from '../services/unscroll';
import PieceOfText from './piece-of-text';
import Expandable from './expandable';
import UserName from './user-name';
import TimeDisplay from './time-display';
import CommentIcon, { JustCommentIcon } from './comment-icon';
import { CommentEditForm } from './comment-edit-form';
import { ButtonLink } from './button-link';
import { PostCommentMore } from './post-comment-more';

class PostComment extends Component {
  commentContainer;
  commentForm;

  constructor(props) {
    super(props);

    this.commentForm = null;
  }

  scrollToComment = () => {
    if (this.commentContainer) {
      const rect = this.commentContainer.getBoundingClientRect();
      const middleScreenPosition =
        window.pageYOffset + (rect.top + rect.bottom) / 2 - window.innerHeight / 2;
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        safeScrollTo(0, middleScreenPosition);
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
    this.enterTimeout && clearTimeout(this.enterTimeout);
  }

  reply = () => this.props.replyWithArrows(this.props.id);
  mention = () => this.props.mentionCommentAuthor(this.props.id);
  backwardIdx = () => this.props.backwardIdx(this.props.id);

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

  handleDeleteComment = confirmFirst(() =>
    this.props.deleteComment(this.props.id, this.props.postId),
  );

  arrowHoverHandlers = {
    hover: (arrows) => this.props.arrowsHighlightHandlers.hover(this.props.id, arrows),
    leave: () => this.props.arrowsHighlightHandlers.leave(),
  };

  like = () => this.props.likeComment(this.props.id);
  unlike = () => this.props.unlikeComment(this.props.id);

  possibleActions() {
    if (!this.props.currentUser.id) {
      // Not authorized
      return {};
    }
    return {
      canLike:
        this.props.currentUser.id !== this.props.user?.id &&
        this.props.hideType === COMMENT_VISIBLE,
      canReply: this.props.hideType === COMMENT_VISIBLE && this.props.canAddComment,
      canDelete: this.props.isEditable || this.props.isDeletable,
    };
  }

  // We use this strange data structure because there can be more than one
  // PostCommentMore element created in the comment (see Expandable/bonusInfo).
  _moreMenuOpeners = [];
  openMoreMenu = () => this._moreMenuOpeners[0]?.();
  setMoreMenuOpener = (o) =>
    void (o ? this._moreMenuOpeners.unshift(o) : this._moreMenuOpeners.shift());

  commentTail() {
    const { canLike, canReply, canDelete } = this.possibleActions();
    return (
      <span
        aria-label={this.props.user ? `Comment by ${this.props.user.username}` : `Hidden comment`}
        className="comment-tail"
      >
        {this.props.user && (
          <span className="comment-tail__item">
            <UserName user={this.props.user} userHover={this.props.authorHighlightHandlers} />
          </span>
        )}
        <span className="comment-tail__item comment-tail__actions">
          {this.props.isEditable && (
            <span className="comment-tail__action">
              <ButtonLink className="comment-tail__action-link" onClick={this.handleEditOrCancel}>
                edit
              </ButtonLink>
            </span>
          )}
          {canDelete && this.props.isModeratingComments && (
            <span className="comment-tail__action">
              <ButtonLink
                className="comment-tail__action-link comment-tail__action-link--delete"
                onClick={this.handleDeleteComment}
              >
                delete
              </ButtonLink>
            </span>
          )}
          <span className="comment-tail__action">
            <PostCommentMore
              className="comment-tail__action-link"
              id={this.props.id}
              authorUsername={this.props.user?.username}
              doEdit={this.props.isEditable && this.handleEditOrCancel}
              doDelete={canDelete && this.handleDeleteComment}
              doReply={canReply && this.reply}
              doMention={canReply && this.mention}
              doLike={canLike && !this.props.hasOwnLike && this.like}
              doUnlike={canLike && this.props.hasOwnLike && this.unlike}
              getBackwardIdx={this.backwardIdx}
              createdAt={this.props.createdAt}
              updatedAt={this.props.updatedAt}
              permalink={`${this.props.entryUrl}#comment-${this.props.id}`}
              likesCount={this.props.likes}
              setMenuOpener={this.setMoreMenuOpener}
            />
          </span>
        </span>
        {(this.props.showTimestamps || this.props.forceAbsTimestamps) && (
          <span className="comment-tail__item">
            <Link
              to={`${this.props.entryUrl}#comment-${this.props.id}`}
              className="comment-tail__timestamp"
            >
              <TimeDisplay
                timeStamp={+this.props.createdAt}
                inline
                absolute={this.props.forceAbsTimestamps}
              />
            </Link>
          </span>
        )}
      </span>
    );
  }

  renderBody() {
    const commentTail = this.commentTail();

    if (this.props.hideType) {
      let { body } = this.props;
      if (this.props.hideType === COMMENT_HIDDEN_BANNED) {
        body = 'Comment from blocked user';
      }
      return (
        <div className="comment-body">
          <span className="comment-text">{body}</span>
          {commentTail}
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

    return (
      <div className="comment-body">
        <Expandable
          expanded={
            this.props.readMoreStyle === READMORE_STYLE_COMPACT ||
            this.props.isSinglePost ||
            this.props.isExpanded
          }
          bonusInfo={commentTail}
          config={commentReadmoreConfig}
        >
          <PieceOfText
            text={this.props.body}
            readMoreStyle={this.props.readMoreStyle}
            highlightTerms={this.props.highlightTerms}
            userHover={this.props.authorHighlightHandlers}
            arrowHover={this.arrowHoverHandlers}
            showMedia={this.props.showMedia}
          />
          {commentTail}
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
        openMoreMenu={this.openMoreMenu}
      />
    );
  }

  render() {
    const className = classnames({
      comment: true,
      highlighted: this.props.highlightComments && this.props.highlighted,
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
        role="comment listitem"
      >
        {this.renderCommentIcon()}
        {this.renderBody()}
      </div>
    );
  }
}

function selectState(state, ownProps) {
  const editState = state.commentEditState[ownProps.id] || defaultCommentState;
  const showTimestamps =
    state.user.frontendPreferences?.comments?.showTimestamps ||
    CONFIG.frontendPreferences.defaultValues.comments.showTimestamps;
  const { highlightComments } = state.user.frontendPreferences.comments;
  return {
    ...editState,
    showTimestamps,
    highlightComments,
    isEditing: ownProps.isEditing || editState.isEditing,
  };
}

export default connect(selectState, null, null, { forwardRef: true })(PostComment);
