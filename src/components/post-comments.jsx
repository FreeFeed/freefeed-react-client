import React from 'react'
import PostComment from './post-comment'
import MoreCommentsWrapper from './more-comments-wrapper' 

export default (props) => {
  const post_comments = props.comments
  .map(comment => {
    return (<PostComment key={comment.id}
                         user={comment.user}
                         createdAgo={comment.createdAgo}
                         body={comment.body} />)               
  })

  return (
    <div className="comments">
      {post_comments}
    </div>
  )
}
