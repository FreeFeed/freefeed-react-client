import React from 'react'

export default (props) => (
  <div className="more-comments-wrapper">
    <a className="more-comments" onClick={(e) => {e.preventDefault(); props.showMoreComments(props.postId)}}>
      {`${props.omittedComments}`} more comments
    </a>
  </div>
)
