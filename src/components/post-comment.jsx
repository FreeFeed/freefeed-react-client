import React from 'react'
import Linkify from'react-linkify'
import UserName from './user-name'

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
        <UserName mode='screen' user={props.user}/>
      </span>

      <span className='controls'>
      </span>
    </div>
  </div>
)
