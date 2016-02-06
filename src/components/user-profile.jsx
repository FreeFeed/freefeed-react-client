import React from 'react'
import {Link} from 'react-router'

import {preventDefault, pluralForm} from '../utils'
import CreatePost from './create-post'
import PieceOfText from './piece-of-text'

export default props => (
<div>
  {!props.isLoading && !props.isUserFound ? (
    <h2>404 Not Found</h2>
  ) : (
    <div className="profile">
      <div className="row">
        <div className="col-sm-9 col-xs-12">
          <div className="avatar">
            <img src={props.profilePictureLargeUrl} width="75" height="75"/>
          </div>
          <div className="description">
            <div className="name">{props.screenName}</div>
            <PieceOfText text={props.description}/>
          </div>
        </div>
        {props.statistics && !props.blocked ? (
          <div className="col-sm-3 col-xs-12">
            <div className="profile-stats">
              {props.type !== 'group' && props.statistics.subscriptions >= 0 ? (
                <div className="profile-stats-item">
                  <Link to={`/${props.username}/subscriptions`}>{pluralForm(props.statistics.subscriptions, 'subscription')}</Link>
                </div>
              ) : false}
              {' '}
              {props.statistics.subscribers >= 0 ? (
                <div className="profile-stats-item">
                  <Link to={`/${props.username}/subscribers`}>{pluralForm(props.statistics.subscribers, 'subscriber')}</Link>
                </div>
              ) : false}
              {' '}
              {props.type !== 'group' && props.statistics.comments >= 0 ? (
                <div className="profile-stats-item">
                  <Link to={`/${props.username}/comments`}>{pluralForm(props.statistics.comments, 'comment')}</Link>
                </div>
              ) : false}
              {' '}
              {props.type !== 'group' && props.statistics.likes >= 0 ? (
                <div className="profile-stats-item">
                  <Link to={`/${props.username}/likes`}>{pluralForm(props.statistics.likes, 'like')}</Link>
                </div>
              ) : false}
            </div>
          </div>
        ) : false}
      </div>
    </div>
  )}

  {props.authenticated && props.isUserFound && !props.isItMe ? (
    props.blocked ? (
      <div>
        You have blocked {props.username}, so all of their posts and comments are invisible to you.
        {' '}
        <a onClick={preventDefault(_=>props.unban({username: props.username, id: props.id}))}>Un-block this user</a>
      </div>
    ) : (
      <div className="profile-controls">
        <div className="row">
          <div className="col-md-7 subscribe-controls">
            {props.subscribed
              ? <a onClick={preventDefault(_=>props.unsubscribe({username: props.username}))}>Unsubscribe</a>
              : <a onClick={preventDefault(_=>props.subscribe({username: props.username}))}>Subscribe</a>}
          </div>
          {props.type !== 'group' && !props.subscribed ? (
            <div className="col-md-5 text-right">
              <a onClick={preventDefault(_=>props.ban({username: props.username, id: props.id}))}>Block this user</a>
            </div>
          ) : props.amIGroupAdmin ? (
            <div className="col-md-5 text-right">
              <Link to={`/${props.username}/settings`}>Settings</Link>
            </div>
          ) : false}
        </div>
      </div>
    )
  ) : false}

  {(props.isItMe && props.isItPostsPage) || (props.type === 'group' && props.subscribed) ? (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      expandSendTo={props.expandSendTo}
      createPostForm={props.createPostForm}
      addAttachmentResponse={props.addAttachmentResponse}/>
  ) : false}
</div>)