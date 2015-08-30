import React from 'react';
import { connect } from 'react-redux';
import {Link} from 'react-router';
import moment from 'moment';

import {fromNowOrNow} from './helpers/moment.jsx'
import {getHome} from './api.jsx'

class PostLikes extends React.Component {
  render() {
    if (true) {
      return <noscript />
    }

    return <div className="likes">
      <i className="fa fa-heart icon"></i>
      …
    </div>
  }
}

class PostComments extends React.Component {
  render() {
    return <noscript/>
  }
}

class FeedPost extends React.Component {
  render() {
    var user = this.props.users[this.props.data.createdBy]
    var screenName = user.screenName

    if (this.props.current_user.id == user.id) {
      screenName = 'You'
    }

    let is_direct = false;
    let directMarker = '';
    if (is_direct) {
      directMarker = <span>»</span>;
    }

    let createdAt = new Date(this.props.data.createdAt - 0)
    let createdAtISO = moment(createdAt).format()
    let createdAgo = fromNowOrNow(createdAt)

    let firstFeedName = user.username  // FIXME

    return (
      <div className="timeline-post-container">
        <div className="avatar">
          <Link to="timeline.index" params={{username: user.username}}>
            <img src={ user.profilePictureMediumUrl } />
          </Link>
        </div>
        <div className="post-body p-timeline-post">
          <div className="title">
            <Link to="timeline.index" params={{username: user.username}} className="post-author">{screenName}</Link>
          </div>

          <div className="body">
            <div className="text">
              {this.props.data.body}
            </div>
          </div>

          <div className="info p-timeline-post-info">
            {directMarker}
            <span className="post-date">
              <Link to="post" params={{username: firstFeedName, postId: this.props.data.id}} className="datetime">
                <time dateTime={createdAtISO} title={createdAtISO}>{createdAgo}</time>
              </Link>
            </span>

            <span className="post-controls">
            </span>

            <PostLikes/>
          </div>

          <PostComments/>
        </div>
      </div>
    )
  }
}

class HomeFeed extends React.Component {
  componentDidMount() {
    this.getHomePromise = getHome(0)
  }

  render() {
    if (!this.props.authenticated) {
      return (
        <noscript/>
      )
    }

    let posts = this.props.posts
    let post_tags = []

    if (this.props.home.length > 0) {
      let posts_with_data = this.props.home.map(post_id => posts[post_id])
      post_tags = posts_with_data.map(post => <FeedPost data={post} key={post.id} users={this.props.users} current_user={this.props.me.user} authenticated={this.props.authenticated}/>)
    }

    return (
      <div className="posts">
        <p>submit-post</p>
        <p>pagination (if not first page)</p>
        <div className="posts">
          {post_tags}
        </div>
        <p>hidden-posts</p>
        <p>pagination</p>
      </div>
    )
  }
}

class HomeHandler extends React.Component {
  render() {
    return (
      <div className="box">
        <div className="box-header-timeline">
          Home
        </div>
        <div className="box-body">
          <HomeFeed authenticated={this.props.authenticated} users={this.props.users} posts={this.props.posts} home={this.props.home} me={this.props.me}/>
        </div>
        <div className="box-footer">

        </div>
      </div>
    )
  }
}

function select(state) {
  return state.toJS();
}

export default connect(select)(HomeHandler);
