import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import moment from 'moment'

import {fromNowOrNow} from './utils/moment'
import {getHome} from './api'

const PostLikes = (props) => (<div/>)

const PostComments = (props) => (<div/>)

const FeedPost = (props) => {
  const user = props.users[props.data.createdBy]
  const screenName = props.current_user.id === user.id ? 'You' : user.screenName

  const isDirect = false

  const createdAt = new Date(props.data.createdAt - 0)
  const createdAtISO = moment(createdAt).format()
  const createdAgo = fromNowOrNow(createdAt)

  const firstFeedName = user.username  // FIXME

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
            {props.data.body}
          </div>
        </div>

        <div className="info p-timeline-post-info">
          {isDirect ? (<span>»</span>) : false}
          <span className="post-date">
            <Link to="post" params={{username: firstFeedName, postId: props.data.id}} className="datetime">
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

const HomeFeed = (props) => {
  const post_tags = props.home
  .map(id => props.posts[id])
  .map(post => (<FeedPost data={post} key={post.id} users={props.users} current_user={props.me.user} authenticated={props.authenticated}/>))

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

const HomeHandler = (props) => {(
  <div className="box">
    <div className="box-header-timeline">
      Home
    </div>
    <div className="box-body">
      {props.authenticated ? (<HomeFeed {...props}/>) : false}
    </div>
    <div className="box-footer">
    </div>
  </div>
)}

function select(state) {
  return state.toJS()
}

export default connect(select)(HomeHandler)
