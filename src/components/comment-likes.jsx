import React from "react";
import classnames from "classnames";
import UserName from "./user-name";


export default class CommentLikes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {likeListVisible: false};
  }
  render() {
    const classNames = classnames('comment-likes', {'has-my-like': this.props.hasOwnLike, 'liked': this.props.likes > 0});
    return <div className={classNames}>
      <div className="comment-count" onClick={this.toggleLikeList}>
        {this.props.likes > 0 ? this.props.likes : ""}
        {this.state.likeListVisible ? this.renderLikesList() : ""}
      </div>
      <div className="comment-heart" onClick={this.props.toggleLike}><i className="fa fa-heart icon"></i></div>
    </div>;
  }
  toggleLikeList = () => {
    const likeListVisible = !this.state.likeListVisible;
    this.setState({likeListVisible});
    if (likeListVisible) {
      window.addEventListener('click', this.toggleLikeList, true);
    } else {
      window.removeEventListener('click', this.toggleLikeList, true);
    }
    if (likeListVisible && this.props.likesList.likes.length === 0 && !this.props.likesList.loading) {
      this.props.getCommentLikes();
    }
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
}
