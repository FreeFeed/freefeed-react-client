import React from 'react';
import classnames from 'classnames';
import { Portal } from 'react-portal';
import { faComment, faHeart as faHeartO } from '@fortawesome/free-regular-svg-icons';
import { faChevronLeft, faHeart, faAngleUp, faAt } from '@fortawesome/free-solid-svg-icons';
import UserName from './user-name';
import TimeDisplay from './time-display';
import { Icon } from './fontawesome-icons';

const longTapTimeout = 300;

export default class CommentLikes extends React.Component {
  actionsOverlay;
  actionsPanel;

  likesListEl;
  setLikesList = (el) => (this.likesListEl = el);

  constructor(props) {
    super(props);
    this.state = {
      likeListVisible: false,
      showActionsPanel: false,
      showActionButtons: true,
    };
  }
  render() {
    return (
      <div
        className="comment-likes-container"
        onTouchStart={this.onTouchStart}
        onTouchEnd={this.onTouchEnd}
        onTouchMove={this.onTouchMove}
        onTouchCancel={this.onTouchCancel}
      >
        {this.renderHeart()}
        {this.renderBubble()}
        {this.renderPopup()}
      </div>
    );
  }
  renderHeart = () => {
    if (this.props.omitLikes) {
      return false;
    }
    const classNames = classnames('comment-likes', {
      'has-my-like': this.props.hasOwnLike,
      liked: this.props.likes > 0,
      'non-likable': this.props.forbidLiking,
    });
    return (
      <div className={classNames}>
        <div className="comment-count" onClick={this.toggleLikeList}>
          {this.props.likes > 0 ? this.props.likes : ''}
          {this.state.likeListVisible ? this.renderLikesList() : ''}
        </div>
        <div className="comment-heart" onClick={this.toggleLike}>
          <Icon
            icon={this.props.forbidLiking ? faHeartO : faHeart}
            className={classnames('icon', { liked: this.state.liked })}
            title={
              this.props.forbidLiking
                ? 'Your own comment'
                : this.props.hasOwnLike
                ? 'Un-like'
                : 'Like'
            }
          />
        </div>
      </div>
    );
  };
  renderBubble = () => {
    const icoProps = { id: `comment-${this.props.commentId}`, onClick: this.openAnsweringComment };
    return this.props.createdAt ? (
      <TimeDisplay
        className="comment-time"
        timeStamp={+this.props.createdAt}
        timeAgoInTitle={false}
      >
        {this.props.omitBubble ? (
          <span className="comment-icon feed-comment-dot" {...icoProps} />
        ) : (
          <Icon icon={faComment} className="comment-icon" {...icoProps} />
        )}
      </TimeDisplay>
    ) : (
      <span className="comment-time">
        {this.props.omitBubble ? (
          <span className="comment-icon feed-comment-dot" />
        ) : (
          <Icon icon={faComment} className="comment-icon" />
        )}
      </span>
    );
  };
  clearTouchTimeout = () => {
    clearTimeout(this.popupTimeout);
    this.popupTimeout = undefined;
  };

  panelJustOpened = false;

  onTouchStart = () => {
    if (this.state.showActionsPanel || this.popupTimeout || this.props.isAddingComment) {
      return;
    }

    this.popupTimeout = setTimeout(() => {
      this.panelJustOpened = true;
      this.setState({ showActionsPanel: true });
      this.clearTouchTimeout();
    }, longTapTimeout);
  };

  onTouchEnd = (e) => {
    if (this.panelJustOpened) {
      this.panelJustOpened = false;
      e.cancelable && e.preventDefault();
      // For iOS browsers that does not support the selectstart event
      window.getSelection().removeAllRanges();
    }
  };

  // Cancel panel opening if touch moved
  onTouchMove = () => this.popupTimeout && this.clearTouchTimeout();

  // Cancel all if touch was cancelled
  onTouchCancel = () => {
    this.popupTimeout && this.clearTouchTimeout();
    this.panelJustOpened = false;
  };

  openAnsweringComment = (e) => {
    e.preventDefault();
    this.clearTouchTimeout();
    if (e.button === 0) {
      const withCtrl = e.ctrlKey || e.metaKey;
      if (withCtrl) {
        this.props.reply();
      } else {
        this.props.mention();
      }
    }
  };

  handleClickOnLikesPanel = (e) => {
    e.stopPropagation();
  };

  registerActionsPanel = (el) => {
    this.actionsPanel = el;
  };

  onSelectStart = (e) => this.panelJustOpened && e.preventDefault();
  registerActionsOverlay = (el) => {
    if (el) {
      el.addEventListener('selectstart', this.onSelectStart);
    } else if (this.actionsOverlay) {
      this.actionsOverlay.removeEventListener('selectstart', this.onSelectStart);
    }
    this.actionsOverlay = el;
  };

  renderPopup = () => {
    const likesStyle = {
      height: (!this.state.showActionButtons && this.state.panelHeight) || 'auto',
    };
    return (
      this.state.showActionsPanel && (
        <Portal isOpened={true}>
          <div
            className="actions-overlay"
            ref={this.registerActionsOverlay}
            onClick={this.toggleActionsPanel}
          >
            <div className="container">
              <div className="row">
                <div className="col-md-9">
                  <div className="actions-panel" ref={this.registerActionsPanel}>
                    <div
                      className={`likes-panel ${this.state.showActionButtons ? 'padded' : ''}`}
                      onClick={this.handleClickOnLikesPanel}
                      style={likesStyle}
                    >
                      <div className="arrow" onClick={this.arrowClick}>
                        <Icon icon={faChevronLeft} />
                      </div>
                      <div className="likes">
                        {this.state.showActionButtons
                          ? this.renderLikesLabel(this.props)
                          : renderMobileLikesList(this.props.likesList)}
                      </div>
                    </div>
                    <div
                      className="mention-actions"
                      style={{
                        transform: `translateY(${this.state.showActionButtons ? '0%' : '100%'})`,
                      }}
                    >
                      {this.props.forbidLiking ? (
                        <div className="mention-action non-likable">
                          <Icon icon={faHeartO} />
                          It{"'"}s your own comment
                        </div>
                      ) : (
                        <button
                          className={`mention-action ${this.props.hasOwnLike ? 'un' : ''}like`}
                          onClick={this.props.toggleLike}
                        >
                          <Icon icon={faHeart} />
                          {`${this.props.hasOwnLike ? 'Un-like' : 'Like'} comment`}
                        </button>
                      )}
                      <button className="mention-action reply" onClick={this.props.reply}>
                        <Icon icon={faAngleUp} />
                        Reply to comment
                      </button>
                      <button className="mention-action mention" onClick={this.props.mention}>
                        <Icon icon={faAt} />
                        Mention username
                      </button>
                    </div>
                  </div>
                </div>
                <div className="col-md-3" />
              </div>
            </div>
          </div>
        </Portal>
      )
    );
  };
  toggleLike = () => {
    this.clearTouchTimeout();
    if (!this.props.forbidLiking) {
      this.setState({ liked: !this.props.hasOwnLike });
      this.props.toggleLike();
    }
  };
  toggleLikeList = (e) => {
    e.stopPropagation();
    this.clearTouchTimeout();
    const likeListVisible = !this.state.likeListVisible;
    this.setState({ likeListVisible });
    if (likeListVisible) {
      window.addEventListener('click', this.toggleLikeList);
    } else {
      window.removeEventListener('click', this.toggleLikeList);
    }
    if (likeListVisible) {
      this.getCommentLikes();
    }
  };
  toggleActionsPanel = () => {
    this.setState({ showActionsPanel: !this.state.showActionsPanel, showActionButtons: true });
  };
  renderLikesList = () => {
    const { loading, likes, error } = this.props.likesList;
    return (
      <div className={classnames('comment-likes-list', { loading, error })} ref={this.setLikesList}>
        {loading
          ? 'Loading...'
          : error
          ? 'Error'
          : likes.map((likeUser, i) => <UserName user={likeUser} key={i} />)}
      </div>
    );
  };
  showLikesList = (e) => {
    e.preventDefault();
    const panelHeight = this.actionsPanel && this.actionsPanel.getBoundingClientRect().height;
    this.setState({
      showActionButtons: false,
      panelHeight,
    });
    this.getCommentLikes();
  };
  arrowClick = () => {
    if (this.state.showActionButtons) {
      this.toggleActionsPanel();
    } else {
      this.setState({ showActionButtons: true });
    }
  };
  getCommentLikes = () => {
    if (
      (this.props.likesList.likes.length === 0 ||
        this.props.likesList.likes.length !== this.props.likes) &&
      !this.props.likesList.loading
    ) {
      this.props.getCommentLikes();
    }
  };
  renderLikesLabel = () => {
    const { likes, hasOwnLike, forbidLiking, likesList } = this.props;
    if (likes === 0) {
      return (
        <i>
          No one has liked this comment yet. {!forbidLiking && 'You will be the first to like it!'}
        </i>
      );
    }
    setTimeout(this.getCommentLikes, 0);
    const { loading, likes: likeUsers } = likesList;
    if (loading) {
      const likesNumber = hasOwnLike ? likes - 1 : likes;
      return (
        <span>
          {hasOwnLike && `You${likesNumber > 0 ? ' and ' : ''}`}
          {likesNumber > 0 && (
            <a className="likes-list-toggle" onClick={this.showLikesList} href="#">
              {likesNumber} {usersPluralize(likesNumber)}
            </a>
          )}
          <span> liked this comment</span>
        </span>
      );
    }
    const otherLikesToRender = likeUsers.slice(0, 4);
    const otherLikes = renderUserLikesList(otherLikesToRender);
    const hiddenLikesNumber = likes - otherLikes.length;
    return (
      <span>
        {otherLikes}
        {hiddenLikesNumber > 0 && (
          <span>
            {' '}
            and{' '}
            <a className="likes-list-toggle" onClick={this.showLikesList} href="#">
              {hiddenLikesNumber} more {usersPluralize(hiddenLikesNumber)}
            </a>
          </span>
        )}{' '}
        liked this comment
      </span>
    );
  };
}

function renderMobileLikesList(likesList) {
  const { loading, likes, error } = likesList;
  if (loading) {
    return <div className="comment-likes-list loading">Loading...</div>;
  }
  if (error) {
    return <div className="comment-likes-list error">Error</div>;
  }
  return <div className="comment-likes-list">{renderUserLikesList(likes)} liked this comment</div>;
}

function renderUserLikesList(userLikes) {
  const maxIndex = userLikes.length - 1;
  return userLikes.map((likeUser, i) => (
    <span key={i}>
      <UserName user={likeUser} />
      {i < maxIndex ? ', ' : ''}
    </span>
  ));
}

const usersPluralize = (count) => `user${count > 1 ? 's' : ''}`;
