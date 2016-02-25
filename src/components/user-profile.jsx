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

  {props.authenticated && props.isUserFound && !props.isItMe && !props.blocked ? (
    <div className="profile-controls">
      <div className="row">
        <div className="col-xs-7 subscribe-controls">
          {props.isPrivate === '1' && !props.subscribed ? (
            props.hasRequestBeenSent ? (
              <span><b>{props.screenName}</b> has been sent your subscription request.</span>
            ) : (
              <a onClick={()=>props.sendSubscriptionRequest({username: props.username, id: props.id})}>Request a subscription</a>
            )
          ) : (
            props.subscribed ? (
              <a onClick={()=>props.unsubscribe({username: props.username})}>Unsubscribe</a>
            ) : (
              <a onClick={()=>props.subscribe({username: props.username})}>Subscribe</a>
            )
          )}
        </div>

        <div className="col-xs-5 text-right">
          {props.type !== 'group' && !props.subscribed ? (
            <a onClick={preventDefault(_=>props.ban({username: props.username, id: props.id}))}>Block this user</a>
          ) : props.amIGroupAdmin ? (
            <Link to={`/${props.username}/settings`}>Settings</Link>
          ) : false}
        </div>
      </div>
    </div>
  ) : false}

  {(props.isItMe && props.isItPostsPage) || (props.type === 'group' && props.subscribed) ? (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      expandSendTo={props.expandSendTo}
      createPostForm={props.createPostForm}
      addAttachmentResponse={props.addAttachmentResponse}
      removeAttachment={props.removeAttachment}/>
  ) : false}
</div>)