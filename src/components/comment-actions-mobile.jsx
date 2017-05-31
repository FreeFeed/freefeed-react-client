import React from "react";
import Portal from "react-portal";
import UserName from "./user-name";

export default class CommentActionsMobile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showActionsPanel: false,
      showActionButtons: true,
    };
  }

  render() {
    const iconClassNames = this.props.likes > 0
                  ? `fa fa-heart${this.props.forbidLiking ? "-o" : ""} ${this.props.hasOwnLike ? "has-my-like" : ""} icon`
                  : `fa ${this.props.omitBubble ? "feed-comment-dot" : "fa-comment-o"}`;

    return <div className="comment-actions-mobile" onClick={this.toggleActionsPanel}>
            {this.props.likes > 0 &&
            <div className={`likes-count ${this.props.hasOwnLike ? "has-my-like" : ""}`}>
              {this.props.likes}
            </div>}
            <i className={iconClassNames}/>
          {this.state.showActionsPanel && <Portal isOpened={true}>
            <div className="actions-overlay" onClick={this.toggleActionsPanel}>
              <div className="actions-panel">
                <div className={`likes-panel ${this.state.showActionButtons ? "" : "big"}`} onClick={e=>e.stopPropagation()}>
                  <div className="arrow" onClick={this.arrowClick}><i className="fa fa-angle-left" aria-hidden="true"/></div>
                  <div className="likes">
                    {this.state.showActionButtons
                      ? renderLikesLabel(this.props.likes, this.props.hasOwnLike, this.showLikesList)
                      : renderLikesList(this.props.likesList)
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
          </Portal>}
          </div>;
  }

  toggleActionsPanel = () => this.setState({showActionsPanel: !this.state.showActionsPanel, showActionButtons: true});

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

function renderLikesList(likesList) {
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
