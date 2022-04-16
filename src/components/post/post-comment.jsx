/* global CONFIG */
import { Component } from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { preventDefault, confirmFirst } from '../../utils';
import {
  READMORE_STYLE_COMPACT,
  COMMENT_HIDDEN_BANNED,
} from '../../utils/frontend-preferences-options';
import { commentReadmoreConfig } from '../../utils/readmore-config';
import { defaultCommentState } from '../../redux/reducers/comment-edit';

import { intentToScroll } from '../../services/unscroll';
import PieceOfText from '../piece-of-text';
import Expandable from '../expandable';
import UserName from '../user-name';
import TimeDisplay from '../time-display';
import CommentIcon, { JustCommentIcon } from '../comment-icon';
import { CommentEditForm } from '../comment-edit-form';
import { ButtonLink } from '../button-link';
import { Separated } from '../separated';

import { PostCommentMore } from './post-comment-more';
import { PostCommentPreview } from './post-comment-preview';

class PostComment extends Component {
  commentContainer;
  commentForm;

  state = {
    moreMenuOpened: false,
    previewVisible: false,
    previewSeqNumber: 0,
    previewLeft: 0,
    previewTop: 0,
  };

  scrollToComment = () => {
    if (this.commentContainer) {
      const rect = this.commentContainer.getBoundingClientRect();
      const middleScreenPosition =
        window.pageYOffset + (rect.top + rect.bottom) / 2 - window.innerHeight / 2;
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        intentToScroll();
        window.scrollTo({
          top: middleScreenPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  componentDidMount() {
    if (this.props.highlightedFromUrl || this.props.focused) {
      setTimeout(this.scrollToComment, 0);
    }
  }

  componentDidUpdate(prevProps) {
    const prev = prevProps.highlightedFromUrl || prevProps.focused;
    const curr = this.props.highlightedFromUrl || this.props.focused;
    if (!prev && curr) {
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

  isHidden() {
    return !!this.props.hideType || this.props.isReplyToBanned;
  }

  hiddenBody() {
    if (this.props.hideType === COMMENT_HIDDEN_BANNED) {
      return 'Comment from blocked user';
    }
    if (this.props.isReplyToBanned) {
      return 'Comment with reply to blocked user';
    }
    return this.props.body;
  }

  handleEditOrCancel = preventDefault(() => this.props.toggleEditingComment(this.props.id));

  handleDeleteComment = confirmFirst(() =>
    this.props.deleteComment(this.props.id, this.props.postId),
  );

  arrowHoverHandlers = {
    hover: (e) => {
      const arrows = parseInt(e.target.dataset['arrows'] || '');
      this.props.arrowsHighlightHandlers.hover(this.props.id, arrows);
    },
    leave: () => this.props.arrowsHighlightHandlers.leave(),
  };

  like = () => this.props.likeComment(this.props.id);
  unlike = () => this.props.unlikeComment(this.props.id);

  closePreview = () => this.state.previewVisible && this.setState({ previewVisible: false });

  arrowClick = (e) => {
    if (this.state.previewVisible) {
      this.closePreview();
      return;
    }

    const arrowsEl = e.currentTarget;

    const arrows = parseInt(arrowsEl.dataset['arrows'] || '');
    const previewSeqNumber = this.props.seqNumber - arrows;
    if (previewSeqNumber <= 0) {
      return;
    }

    const arrowsRect = arrowsEl.getBoundingClientRect();
    const commentRect = this.commentContainer
      .querySelector('.comment-body')
      .getBoundingClientRect();

    this.setState({
      previewVisible: true,
      previewSeqNumber,
      previewLeft: arrowsRect.left + arrowsRect.width / 2 - commentRect.left,
      previewTop: arrowsRect.top - commentRect.top,
    });
  };

  possibleActions() {
    if (!this.props.currentUser.id) {
      // Not authorized
      return {};
    }
    const ownComment = this.props.currentUser.id === this.props.user?.id;
    return {
      ownComment,
      canLike: !ownComment && !this.isHidden(),
      canReply: !this.isHidden() && this.props.canAddComment,
      canDelete: this.props.isEditable || this.props.isDeletable,
    };
  }

  // We use this strange data structure because there can be more than one
  // PostCommentMore element created in the comment (see Expandable/bonusInfo).
  _moreMenuOpeners = [];
  openMoreMenu = () => this._moreMenuOpeners[0]?.();
  setMoreMenuOpener = (o) =>
    void (o ? this._moreMenuOpeners.unshift(o) : this._moreMenuOpeners.shift());

  onMoreMenuOpened = (moreMenuOpened) => this.setState({ moreMenuOpened });

  commentTail() {
    const { canLike, canReply, canDelete, ownComment } = this.possibleActions();
    return (
      <span
        aria-label={
          this.props.user && !this.isHidden()
            ? `Comment by ${this.props.user.username}`
            : `Hidden comment`
        }
        className="comment-tail"
      >
        {' - '}
        <Separated separator=" - ">
          {this.props.user && !this.isHidden() && (
            <span className="comment-tail__item">
              <UserName user={this.props.user} userHover={this.props.authorHighlightHandlers} />
            </span>
          )}
          <span className="comment-tail__item comment-tail__actions">
            <Separated separator=" | ">
              {this.props.isEditable && (
                <span className="comment-tail__action">
                  <ButtonLink
                    className="comment-tail__action-link"
                    onClick={this.handleEditOrCancel}
                  >
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
                  className="comment-tail__action-link comment-tail__action-link--more"
                  id={this.props.id}
                  authorUsername={this.props.user?.username}
                  doEdit={this.props.isEditable && this.handleEditOrCancel}
                  doDelete={canDelete && ownComment && this.handleDeleteComment}
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
                  onMenuOpened={this.onMoreMenuOpened}
                />
              </span>
            </Separated>
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
        </Separated>
      </span>
    );
  }

  renderBody() {
    const commentTail = this.commentTail();

    if (this.isHidden()) {
      return (
        <div className="comment-body">
          <span className="comment-text">{this.hiddenBody()}</span>
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
          submitMode={this.props.submitMode}
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
            arrowClick={this.arrowClick}
            showMedia={this.props.showMedia}
          />
          {commentTail}
        </Expandable>
      </div>
    );
  }

  renderCommentIcon() {
    const { props } = this;
    if (this.isHidden()) {
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

  renderPreview() {
    return (
      this.state.previewVisible && (
        <PostCommentPreview
          postId={this.props.postId}
          seqNumber={this.state.previewSeqNumber}
          postUrl={this.props.entryUrl}
          close={this.closePreview}
          onCommentLinkClick={this.props.onCommentLinkClick}
          arrowsLeft={this.state.previewLeft}
          arrowsTop={this.state.previewTop}
        />
      )
    );
  }

  render() {
    const className = classnames({
      comment: true,
      highlighted:
        (this.props.highlightComments && this.props.highlighted) || this.state.moreMenuOpened,
      'omit-bubble': this.props.omitBubble,
      'is-hidden': this.isHidden(),
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
        {this.renderPreview()}
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
  const isReplyToBanned = (() => {
    if (
      !state.user.frontendPreferences?.comments.hideRepliesToBanned ||
      ownProps.createdBy === state.user.id
    ) {
      return false;
    }
    const m = ownProps.body?.match(/^@([a-z\d]+)/i);
    return m && state.bannedUsernames.includes(m[1].toLowerCase());
  })();
  return {
    ...editState,
    showTimestamps,
    highlightComments,
    isEditing: ownProps.isEditing || editState.isEditing,
    submitMode: state.submitMode,
    isReplyToBanned,
  };
}

export default connect(selectState, null, null, { forwardRef: true })(PostComment);
