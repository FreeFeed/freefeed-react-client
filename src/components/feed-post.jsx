import React from 'react'
import {Link} from 'react-router'
import moment from 'moment'
import Linkify from 'react-linkify'

import {fromNowOrNow} from '../utils'
import PostComments from './post-comments'
import PostLikes from './post-likes'
import UserName from './user-name'
import FeedPost from './feed-post'

export default (props) => {
  const isDirect = false

  const createdAt = new Date(props.createdAt - 0)
  const createdAtISO = moment(createdAt).format()
  const createdAgo = fromNowOrNow(createdAt)

  return (
    <div className='timeline-post-container'>
      <div className='avatar'>
        <Link to='timeline.index' params={{username: props.createdBy.username}}>
          <img src={ props.createdBy.profilePictureMediumUrl } />
        </Link>
      </div>
      <div className='post-body p-timeline-post'>
        <div className='title'>
          <UserName className='post-author' user={props.createdBy}/>
        </div>

        <div className='body'>
          <div className='text'>
            <Linkify>{props.body}</Linkify>
          </div>
        </div>

        <div className='info p-timeline-post-info'>
          {isDirect ? (<span>»</span>) : false}
          <span className='post-date'>
            <Link to='post' params={{username: props.createdBy.username, postId: props.id}} className='datetime'>
              <time dateTime={createdAtISO} title={createdAtISO}>{createdAgo}</time>
            </Link>
          </span>

          <span className='post-controls'>
          </span>

          <PostLikes post={props} likes={props.usersLikedPost} showMoreLikes={props.showMoreLikes} />
        </div>

        <PostComments post={props}
                      comments={props.comments}
                      showMoreComments={props.showMoreComments} />
      </div>
    </div>
  )
}