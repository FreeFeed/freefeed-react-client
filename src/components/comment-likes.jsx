import React from "react";
import classnames from "classnames";
import Portal from "react-portal";
import UserName from "./user-name";
import TimeDisplay from './time-display';

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
    return <div className="comment-likes-container" onTouchStart={this.showPopup} onTouchEnd={e => e.preventDefault()}>
        {this.renderHeart()}
        {this.renderBubble()}
        {this.renderPopup()}
      </div>;
  }
  renderHeart = () => {
    const classNames = classnames("comment-likes", {"has-my-like": this.props.hasOwnLike, "liked": this.props.likes > 0, "non-likable": this.props.forbidLiking});
    return <div className={classNames}>
      <div className="comment-count" onClick={this.toggleLikeList}>
        {this.props.likes > 0 ? this.props.likes : ""}
        {this.state.likeListVisible ? this.renderLikesList() : ""}
      </div>
      <div className="comment-heart" onClick={this.toggleLike}>
        <i  className={`fa fa-heart${this.props.forbidLiking ? "-o" : ""} icon`}
            title={this.props.forbidLiking ? "Your own comment" : this.props.hasOwnLike ? "Un-like" : "Like"}>
        </i>
      </div>
    </div>;
  }
  renderBubble = () => {
    return <TimeDisplay className="comment-time" timeStamp={+this.props.createdAt} timeAgoInTitle={true}>
               <a
                  className={`comment-icon fa ${this.props.omitBubble ? 'feed-comment-dot' : 'fa-comment-o'}`}
                  id={`comment-${this.props.commentId}`}
                  href={`${this.props.entryUrl}#comment-${this.props.commentId}`}
                  onClick={this.openAnsweringComment}></a>
              </TimeDisplay>;
  }
  showPopup = (e) => {
    e.preventDefault();
    this.setState({showActionsPanel: true});
  }
  openAnsweringComment = (event) => {
    event.preventDefault();
    if (event.button === 0) {
      const withCtrl = event.ctrlKey || event.metaKey;
      if (withCtrl) {
        this.props.reply();
      } else {
        this.props.mention();
      }
    }
  }
  renderPopup = () => {
    return this.state.showActionsPanel && <Portal isOpened={true}>
            <div className="actions-overlay" onClick={this.toggleActionsPanel}>
            <div className="container">
            <div className="row">
            <div className="col-md-9">
              <div className="actions-panel">
                <div className={`likes-panel ${this.state.showActionButtons ? "" : "big"}`} onClick={e=>e.stopPropagation()}>
                  <div className="arrow" onClick={this.arrowClick}><i className="fa fa-angle-left" aria-hidden="true"/></div>
                  <div className="likes">
                    {this.state.showActionButtons
                      ? renderLikesLabel(this.props.likes, this.props.hasOwnLike, this.showLikesList)
                      : renderMobileLikesList(this.props.likesList)
                    }
                  </div>
                </div>
                {this.state.showActionButtons &&
                  <div className="mention-actions">
                    {this.props.forbidLiking
                    ? <div className="mention-action non-likable">
                        <i className="fa fa-heart-o" aria-hidden="true"/>
                        It's your own comment
                      </div>
                    : <button  className={`mention-action ${this.props.hasOwnLike ? "un":""}like`}
                            onClick={this.props.toggleLike}>
                        <i className="fa fa-heart" aria-hidden="true"/>
                        {`${this.props.hasOwnLike ? "Un-like" : "Like"} comment`}
                      </button>}
                    <button  className='mention-action reply'
                          onClick={this.props.reply}>
                      <i className="fa fa-angle-up" aria-hidden="true"/>
                      Reply to comment
                    </button>
                    <button  className='mention-action mention'
                          onClick={this.props.mention}>
                      <i className="fa fa-at" aria-hidden="true"/>
                      Mention username
                    </button>
                  </div>}
              </div>
              </div>
              <div className="col-md-3"></div>
              </div></div>
            </div>
          </Portal>;
  }
  toggleLike = () => {
    if (!this.props.forbidLiking) {
      this.props.toggleLike();
    }
  }
  toggleLikeList = () => {
    const likeListVisible = !this.state.likeListVisible;
    this.setState({likeListVisible});
    if (likeListVisible) {
      window.addEventListener("click", this.toggleLikeList, true);
    } else {
      window.removeEventListener("click", this.toggleLikeList, true);
    }
    if (likeListVisible && this.props.likesList.likes.length === 0 && !this.props.likesList.loading) {
      this.props.getCommentLikes();
    }
  }
  toggleActionsPanel = () => {
    this.setState({showActionsPanel: !this.state.showActionsPanel, showActionButtons: true});
  }
  renderLikesList = () => {
    const {loading, likes, error} = this.props.likesList;
    if (loading) {
      return <div className="comment-likes-list loading">Loading...</div>;
    }
    if (error) {
      return <div className="comment-likes-list error">Error</div>;
    }
    return <div className="comment-likes-list">{likes.map((likeUser, i) => <UserName user={likeUser} key={i}/>)}</div>;
  }
  showLikesList = (e) => {
    e.preventDefault();
    this.setState({
      showActionButtons: false,
    });
    this.props.getCommentLikes();
  }
  arrowClick = () => {
    if (this.state.showActionButtons) {
      this.toggleActionsPanel();
    } else {
      this.setState({showActionButtons: true});
    }
  }
}

function renderMobileLikesList(likesList) {
  const {loading, likes, error} = likesList;
  if (loading) {
    return <div className="comment-likes-list loading">Loading...</div>;
  }
  if (error) {
    return <div className="comment-likes-list error">Error</div>;
  }
  const maxIndex = likes.length - 1;
  return <div className="comment-likes-list">
          Comment liked by {likes.map((likeUser, i) => <span key={i}>
            <UserName user={likeUser}/>{i < maxIndex ? ", ": ""}
          </span>)}
        </div>;
}

const usersPluralize = count => `user${count > 1 ? "s" : ""}`;

function renderLikesLabel(likes, hasOwnLike, showLikesList) {
  return likes > 0
    ? hasOwnLike
      ? <span>You{likes-1 > 0 &&
          <span>
            <span> and </span>
            <a className="likes-list-toggle" onClick={showLikesList} href="#">{likes-1} {usersPluralize(likes-1)}</a>
          </span>
          }
        <span> liked this comment</span>
        </span>
      : <span><a className="likes-list-toggle" onClick={showLikesList} href="#">{likes} {usersPluralize(likes)}</a> liked this comment</span>
    : <i>No one has liked this comment yet. You will be the first to like it!</i>;
}
