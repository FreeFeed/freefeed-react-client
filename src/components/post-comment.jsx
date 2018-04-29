import React from 'react';
import Textarea from 'react-textarea-autosize';
import _ from 'lodash';
import classnames from 'classnames';

import throbber16 from '../../assets/images/throbber-16.gif';
import { preventDefault, confirmFirst } from '../utils';
import { READMORE_STYLE_COMPACT, COMMENT_DELETED } from '../utils/frontend-preferences-options';
import { commentReadmoreConfig } from '../utils/readmore-config';

import CommentLikes from './comment-likes';
import PieceOfText from './piece-of-text';
import Expandable from './expandable';
import UserName from './user-name';


export default class PostComment extends React.Component {
  commentContainer;
  commentTextArea;

  constructor(props) {
    super(props);

    this.state = {
      editText: this.props.editText || ''
    };
    this.commentTextArea = null;
  }

  scrollToComment = () => {
    if (this.commentContainer) {
      const rect = this.commentContainer.getBoundingClientRect();
      const middleScreenPosition = window.pageYOffset + ((rect.top + rect.bottom) / 2) - (window.innerHeight / 2);
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

  handleChange = (event) => {
    this.setState({
      editText: event.target.value || ''
    });
  };

  reply = () => {
    this.props.openAnsweringComment(_.repeat('^', this.props.backwardNumber));
  };

  mention = () => {
    this.props.openAnsweringComment(`@${this.props.user.username}`);
  };

  setCaretToTextEnd = (event) => {
    const input = event.target;

    setTimeout(() => {
      if (typeof input.selectionStart === 'number') {
        input.selectionStart = input.selectionEnd = input.value.length;
      } else if (input.createTextRange !== undefined) {
        input.focus();
        const range = input.createTextRange();
        range.collapse(false);
        range.select();
      }
    }, 0);
  };

  updateCommentingText = () => {
    if (this.props.updateCommentingText) {
      this.props.updateCommentingText(this.props.id, this.state.editText);
    }
  };

  checkSave = (event) => {
    const isEnter = event.keyCode === 13;
    const isShiftPressed = event.shiftKey;
    if (isEnter && !isShiftPressed) {
      event.preventDefault();
      event.target.blur();
      setTimeout(this.saveComment, 0);
    }
  };

  saveComment = () => {
    if (!this.props.isSaving) {
      this.props.saveEditingComment(this.props.id, this.state.editText || this.props.editText);
    }
  };

  focus() {
    if (this.commentTextArea) {
      this.commentTextArea.focus();
    }
  }

  toggleLike = () => {
    return this.props.hasOwnLike
      ? this.props.unlikeComment(this.props.id)
      : this.props.likeComment(this.props.id);
  };

  getCommentLikes = () => {
    this.props.getCommentLikes(this.props.id);
  };

  componentWillReceiveProps(newProps) {
    if ((this.props.editText || '') !== newProps.editText) {
      this.setState({ editText: newProps.editText });
    }
  }

  registerCommentContainer = (el) => {
    this.commentContainer = el;
  };

  registerCommentTextArea = (el) => {
    this.commentTextArea = el;
  };

  handleEditOrCancel = preventDefault(() => this.props.toggleEditingComment(this.props.id));

  handleDeleteComment = confirmFirst(() => this.props.deleteComment(this.props.id));

  handleHoverOnUsername = (username) => {
    this.props.highlightComment(username);
  };

  handleHoverOverArrow = (arrows) => {
    this.props.highlightArrowComment(this.props.id, arrows);
  };

  renderBody() {
    if (this.props.hideType) {
      const isDeletable = this.props.isDeletable && this.props.hideType !== COMMENT_DELETED;
      return (
        <div className="comment-body">
          <span className="comment-text">{this.props.body}</span>
          {(isDeletable && this.props.isModeratingComments) ? (
            <span>
              {' - '}(<a onClick={this.handleDeleteComment}>delete</a>)
            </span>
          ) : false}
        </div>
      );
    }

    if (this.props.isEditing) {
      return (
        <div className="comment-body">
          <div>
            <Textarea
              autoFocus={!this.props.isSinglePost}
              inputRef={this.registerCommentTextArea}
              className="comment-textarea"
              value={this.state.editText || ''}
              onFocus={this.setCaretToTextEnd}
              onChange={this.handleChange}
              onKeyDown={this.checkSave}
              onBlur={this.updateCommentingText}
              minRows={2}
              maxRows={10}
              maxLength="1500"
            />
          </div>
          {this.props.isSinglePost ? (
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Comment</button>
            </span>
          ) : (
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Post</button>
              <a className="comment-cancel" onClick={this.handleEditOrCancel}>Cancel</a>
            </span>
          )}
          {this.props.isSaving ? (
            <span className="comment-throbber">
              <img width="16" height="16" src={throbber16} />
            </span>
          ) : false}
          {this.props.errorString ? (
            <span className="comment-error">{this.props.errorString}</span>
          ) : false}
        </div>
      );
    }

    const authorAndButtons = (
      <span>
        {' -'}&nbsp;
        <UserName user={this.props.user} />
        {this.props.isEditable ? (
          <span>
            {' '}(<a onClick={this.handleEditOrCancel}>edit</a>
                  &nbsp;|&nbsp;
            <a onClick={this.handleDeleteComment}>delete</a>)
          </span>
        ) : (this.props.isDeletable && this.props.isModeratingComments) ? (
          <span>
            {' '}(<a onClick={this.handleDeleteComment}>delete</a>)
          </span>
        ) : false}
      </span>
    );

    return (
      <div className="comment-body">
        <Expandable
          expanded={this.props.readMoreStyle === READMORE_STYLE_COMPACT || this.props.isSinglePost || this.props.isExpanded}
          bonusInfo={authorAndButtons}
          config={commentReadmoreConfig}
        >
          <PieceOfText
            text={this.props.body}
            readMoreStyle={this.props.readMoreStyle}
            highlightTerms={this.props.highlightTerms}
            userHover={{
              hover: this.handleHoverOnUsername,
              leave: this.props.clearHighlightComment
            }}
            arrowHover={{
              hover: this.handleHoverOverArrow,
              leave: this.props.clearHighlightComment
            }}
          />
          {authorAndButtons}
        </Expandable>
      </div>
    );
  }

  renderCommentLikes() {
    if (this.props.hideType) {
      return false;
    }
    return (
      <CommentLikes
        commentId={this.props.id}
        entryUrl={this.props.entryUrl}
        omitBubble={this.props.omitBubble}
        createdAt={this.props.createdAt}
        likes={this.props.likes}
        forbidLiking={this.props.isEditable}
        omitLikes={this.props.isEditing}
        hasOwnLike={this.props.hasOwnLike}
        toggleLike={this.toggleLike}
        likesList={this.props.likesList}
        getCommentLikes={this.getCommentLikes}
        reply={this.reply}
        mention={this.mention}
      />
    );
  }

  render() {
    const className = classnames({
      'comment': true,
      'highlighted': this.props.highlighted,
      'omit-bubble': this.props.omitBubble,
      'is-hidden': !!this.props.hideType,
      'highlight-from-url': this.props.highlightedFromUrl,
      'my-comment': this.props.currentUser && this.props.user && (this.props.currentUser.id === this.props.user.id)
    });


    return (
      <div
        className={className}
        data-author={this.props.isEditing ? '' : this.props.user.username}
        ref={this.registerCommentContainer}
      >
        {this.renderCommentLikes()}
        {this.renderBody()}
      </div>
    );
  }
}
