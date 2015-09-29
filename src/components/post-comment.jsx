import React from 'react'
import Linkify from'react-linkify'

export default (props) => (
  <div className='comment p-comment'>
    <a className='date' title={props.createdAgo}>
      <i className='fa fa-comment-o icon'></i>
    </a>
    <div className='body p-comment-body'>
      <span className='comment-text'>
        <Linkify>{props.body}</Linkify>
      </span>
      &nbsp;-&nbsp;
      <span className='author'>
        <a href={`/${props.user.username}`}>{props.user.screenName}</a>
      </span>

      <span className='controls'>
      </span>
    </div>
  </div>
)
