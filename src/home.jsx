import React from 'react';
import FluxComponent from 'flummox/component';
import {Link} from 'react-router';
import moment from 'moment';

import {fromNowOrNow} from './helpers/moment'

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
    var user = this.props.users.get(this.props.data.get('createdBy'))
    var screenName = user.get('screenName')

    if (this.props.current_user.get('id') == user.get('id')) {
      screenName = 'You'
    }

    let is_direct = false;
    let directMarker = '';
    if (is_direct) {
      directMarker = <span>»</span>;
    }

    let createdAt = new Date(this.props.data.get('createdAt') - 0)
    let createdAtISO = moment(createdAt).format()
    let createdAgo = fromNowOrNow(createdAt)

    let firstFeedName = user.get('username')  // FIXME

    return (
      <div className="timeline-post-container">
        <div className="avatar">
          <Link to="timeline.index" params={{username: user.get('username')}}>
            <img src={ user.get('profilePictureMediumUrl') } />
          </Link>
        </div>
        <div className="post-body p-timeline-post">
          <div className="title">
            <Link to="timeline.index" params={{username: user.get('username')}} className="post-author">{screenName}</Link>
          </div>

          <div className="body">
            <div className="text">
              {this.props.data.get('body')}
            </div>
          </div>

          <div className="info p-timeline-post-info">
            {directMarker}
            <span className="post-date">
              <Link to="post" params={{username: firstFeedName, postId: this.props.data.get('id')}} className="datetime">
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
    this.props.flux.getActions('posts').getHome(0)
  }

  render() {
    if (!this.props.authenticated) {
      return (
        <noscript/>
      )
    }

    let posts = this.props.posts
    let posts_with_data = this.props.home.map(post_id => posts.get(post_id))

    return (
      <div className="posts">
        <p>submit-post</p>
        <p>pagination (if not first page)</p>
        <div className="posts">
          <FluxComponent connectToStores={{
            auth: store => ({
              current_user: store.getUser(),
              authenticated: store.state.authenticated
            })
          }}>
            {posts_with_data.map(post => <FeedPost data={post} key={post.get('id')} users={this.props.users}/>)}
          </FluxComponent>
        </div>
        <p>hidden-posts</p>
        <p>pagination</p>
      </div>
    )
  }
}

export default class HomeHandler extends React.Component {
  render() {
    return (
      <div className="box">
        <div className="box-header-timeline">
          Home
        </div>
        <div className="box-body">
          <FluxComponent connectToStores={{
            posts: store => ({
              authenticated: store.state.authenticated,
              posts: store.state.posts,
              home: store.state.home,
              users: store.state.users
            })
          }}>
            <HomeFeed/>
          </FluxComponent>
        </div>
        <div className="box-footer">

        </div>
      </div>
    )
  }
}
