import React from 'react'

export default (props) => (
  <div className='comments'>
    <div className='comment p-comment'>
      <a className='date' title={props.createdAgo}>
        <i className='fa fa-comment-o icon'></i>
      </a>
      <div className='body p-comment-body'>
        <span className='comment-text'>
          {props.body}
        </span>
        &nbsp;-&nbsp;
        <span className='author'>
          <a href={`/${props.user.username}`}>{props.user.screenName}</a>
        </span>

        <span className='controls'>
        </span>
      </div>
    </div>
  </div>
)
