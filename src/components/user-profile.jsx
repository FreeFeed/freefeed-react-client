import React from 'react'
import {Link} from 'react-router'
import {preventDefault} from '../utils'
import CreatePost from './create-post'

export default props => (
<div>
  <div className='profile p-user-profile'>
    <div className='row'>
      <div className='col-md-9'>
        <div className='avatar'>
          <img src={props.profilePictureLargeUrl} width="75" height="75"/>
        </div>
        <div className='description'>
          <div className='name'>{props.username}</div>
          {props.type === 'group' ? (
            <p><Link to={`/${props.username}/settings`}>Settings</Link></p>
          ) : false}
          <p>{props.description}</p>
        </div>
      </div>
      {props.statistics && !props.blocked ? (
        <div className='col-md-3'>
          <div className='stats'>
            {props.statistics.subscriptions >= 0 ? <div className='p-stats-subscriptions'>
              <Link to={`/${props.username}/subscriptions`}>{props.statistics.subscriptions} subscriptions</Link>
            </div> : false}
            {props.statistics.subscribers >= 0 ? <div className='p-stats-subscribers'>
              <Link to={`/${props.username}/subscribers`}>{props.statistics.subscribers} subscribers</Link>
            </div> : false}
            {props.statistics.comments >= 0 ? <div className='p-stats-comments'>
              <Link to={`/${props.username}/comments`}>{props.statistics.comments} comments</Link>
            </div> : false}
            {props.statistics.likes >= 0 ? <div className='p-stats-likes'>
              <Link to={`/${props.username}/likes`}>{props.statistics.likes} likes</Link>
            </div> : false}
          </div>
        </div>
      ) : false}
    </div>
  </div>
  {props.me ? (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      expandSendTo={props.expandSendTo}
      createPostForm={props.createPostForm}
      addAttachmentResponse={props.addAttachmentResponse}/>
  ) : props.blocked ? (
    <div>
      You have blocked {props.username}, so all of {props.username}'s posts and comments are invisible to you.
      <a onClick={preventDefault(_=>props.unban({username: props.username, id: props.id}))}>Un-block this user</a>
    </div>
  ) : props.authenticated ? (
    <div className='profile-controls'>
      <div className='row'>
        <div className='col-md-7 subscribe-controls'>
          {props.subscribed ?
            <a onClick={preventDefault(_=>props.unsubscribe({username: props.username}))} className='p-unsubscribe'>Unsubscribe</a> :
            <a onClick={preventDefault(_=>props.subscribe({username: props.username}))} className='p-unsubscribe'>Subscribe</a>}
        </div>
        <div className='col-md-5 block-controls'>
          {props.subscribed ?
            false :
            <a onClick={preventDefault(_=>props.ban({username: props.username, id: props.id}))}>Block this user</a>}
        </div>
      </div>
    </div>
  ) : false}
</div>)