import React from "react";
import classnames from "classnames";
import Portal from "react-portal";
import UserName from "./user-name";
import TimeDisplay from "./time-display";


export default class CommentLikes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      likeListVisible: false,
      showActionsPanel: false,
      showActionButtons: true,
    };
  }
  render() {
    return <div className="comment-likes-container"
      onTouchStart={this.startTouch}
      onTouchEnd={this.endTouch}
      onMouseDown={this.startMouseDown}
      onMouseUp={this.endMouseDown}>
      {this.renderHeart()}
      {this.renderBubble()}
      {this.renderPopup()}
    </div>;
  }
  renderHeart = () => {
    if (this.props.omitLikes) {
      return false;
    }
    const classNames = classnames("comment-likes", { "has-my-like": this.props.hasOwnLike, "liked": this.props.likes > 0, "non-likable": this.props.forbidLiking });
    return <div className={classNames}>
      <div className="comment-count" onClick={this.toggleLikeList}>
        {this.props.likes > 0 ? this.props.likes : ""}
        {this.state.likeListVisible ? this.renderLikesList() : ""}
      </div>
      <div className="comment-heart" onClick={this.toggleLike}>
        <i  className={`fa fa-heart${this.props.forbidLiking ? "-o" : ""} ${this.state.liked ? "liked" : ""} icon`}
          title={this.props.forbidLiking ? "Your own comment" : this.props.hasOwnLike ? "Un-like" : "Like"}>
        </i>
      </div>
    </div>;
  };
  renderBubble = () => {
    return this.props.createdAt
      ? <TimeDisplay className="comment-time" timeStamp={+this.props.createdAt} timeAgoInTitle={true}>
        <span
          className={`comment-icon fa ${this.props.omitBubble ? "feed-comment-dot" : "fa-comment-o"}`}
          id={`comment-${this.props.commentId}`}
          onClick={this.openAnsweringComment}/>
      </TimeDisplay>
      : <span className="comment-time">
        <span className={`comment-icon fa ${this.props.omitBubble ? "feed-comment-dot" : "fa-comment-o"}`}/>
      </span>
    ;
  };
  clearTouchTimeout = () => {
    clearTimeout(this.popupTimeout);
    this.popupTimeout = undefined;
  };
  startTouch = (e) => {
    e.preventDefault();
    this.popupTimeout = setTimeout(() => {
      this.setState({ showActionsPanel: true });
      this.clearTouchTimeout();
    }, 300);
  };
  endMouseDown = () => this.clearTouchTimeout();
  endTouch = (e) => {
    e.preventDefault();
    if (this.popupTimeout) {
      this.clearTouchTimeout();
      if (isBubble(e.target)) {
        this.props.mention();
      }
      if (isHeart(e.target)) {
        this.toggleLike(e);
      }
    }
  };
  startMouseDown = () => {
    if (!this.state.showActionsPanel) {
      this.popupTimeout = setTimeout(() => {
        this.setState({ showActionsPanel: true });
        this.clearTouchTimeout();
      }, 300);
    }
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
  renderPopup = () => {
    const likesStyle = {
      height: !this.state.showActionButtons && this.state.panelHeight || "auto",
    };
    return this.state.showActionsPanel && <Portal isOpened={true}>
      <div className="actions-overlay" onClick={this.toggleActionsPanel}>
        <div className="container">
          <div className="row">
            <div className="col-md-9">
              <div className="actions-panel" ref={(r) => this.actionsPanel = r}>
                <div className={`likes-panel ${this.state.showActionButtons ? "padded" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                  style={likesStyle}>
                  <div className="arrow" onClick={this.arrowClick}><i className="fa fa-angle-left" aria-hidden="true"/></div>
                  <div className="likes">
                    {this.state.showActionButtons
                      ? this.renderLikesLabel(this.props)
                      : renderMobileLikesList(this.props.likesList)
                    }
                  </div>
                </div>
                <div className="mention-actions" style={{ transform:`translateY(${this.state.showActionButtons ? "0%" : "100%"})` }}>
                  {this.props.forbidLiking
                    ? <div className="mention-action non-likable">
                      <i className="fa fa-heart-o" aria-hidden="true"/>
                      It"s your own comment
                    </div>
                    : <button  className={`mention-action ${this.props.hasOwnLike ? "un" : ""}like`}
                      onClick={this.props.toggleLike}>
                      <i className="fa fa-heart" aria-hidden="true"/>
                      {`${this.props.hasOwnLike ? "Un-like" : "Like"} comment`}
                    </button>}
                  <button  className="mention-action reply"
                    onClick={this.props.reply}>
                    <i className="fa fa-angle-up" aria-hidden="true"/>
                    Reply to comment
                  </button>
                  <button  className="mention-action mention"
                    onClick={this.props.mention}>
                    <i className="fa fa-at" aria-hidden="true"/>
                    Mention username
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-3"></div>
          </div></div>
      </div>
    </Portal>;
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
      window.addEventListener("click", this.toggleLikeList, true);
    } else {
      window.removeEventListener("click", this.toggleLikeList, true);
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
    if (loading) {
      return <div className="comment-likes-list loading">Loading...</div>;
    }
    if (error) {
      return <div className="comment-likes-list error">Error</div>;
    }
    return <div className="comment-likes-list">{likes.map((likeUser, i) => <UserName user={likeUser} key={i}/>)}</div>;
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
    if ((this.props.likesList.likes.length === 0 || this.props.likesList.likes.length !== this.props.likes) && !this.props.likesList.loading) {
      this.props.getCommentLikes();
    }
  };
  renderLikesLabel = () => {
    const { likes, hasOwnLike, forbidLiking, likesList } = this.props;
    if (likes === 0) {
      return <i>No one has liked this comment yet. {!forbidLiking && "You will be the first to like it!"}</i>;
    }
    setTimeout(this.getCommentLikes, 0);
    const { loading, likes: likeUsers } = likesList;
    if (loading) {
      const likesNumber = hasOwnLike ? likes - 1 : likes;
      return <span>{hasOwnLike && `You${likesNumber > 0 ? " and " : ""}`}{likesNumber > 0 &&
          <a className="likes-list-toggle" onClick={this.showLikesList} href="#">{likesNumber} {usersPluralize(likesNumber)}</a>}
      <span> liked this comment</span>
      </span>;
    }
    const otherLikesToRender = likeUsers.slice(0, 4);
    const otherLikes = renderUserLikesList(otherLikesToRender);
    const hiddenLikesNumber = likes - otherLikes.length;
    return <span>{otherLikes}{hiddenLikesNumber > 0 && <span> and <a className="likes-list-toggle" onClick={this.showLikesList} href="#">{hiddenLikesNumber} more {usersPluralize(hiddenLikesNumber)}</a></span>} liked this comment</span>;
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
  return <div className="comment-likes-list">
    {renderUserLikesList(likes)} liked this comment
  </div>;
}

function renderUserLikesList(userLikes) {
  const maxIndex = userLikes.length - 1;
  return userLikes.map((likeUser, i) => <span key={i}>
    <UserName user={likeUser}/>{i < maxIndex ? ", " : ""}
  </span>);
}

const usersPluralize = (count) => `user${count > 1 ? "s" : ""}`;

function isBubble(vNode) {
  return vNode.classList.contains("comment-time")
  || vNode.classList.contains("comment-icon");
}

function isHeart(vNode) {
  return vNode.classList.contains("comment-heart")
  || vNode.classList.contains("fa-heart")
  || vNode.classList.contains("comment-likes");
}
