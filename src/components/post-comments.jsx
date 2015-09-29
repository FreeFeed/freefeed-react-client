import React from 'react'
import PostComment from './post-comment'
import MoreCommentsWrapper from './more-comments-wrapper' 

const renderComment = comment => (<PostComment key={comment.id}
                                               user={comment.user}
                                               createdAgo={comment.createdAgo}
                                               body={comment.body} />)

export default (props) => {
  const first = props.comments[0]
  const last = props.comments.length > 1 && props.comments[props.comments.length - 1]
  const middle = props.comments.slice(1, props.comments.length - 1).map(renderComment)

  return (
    <div className="comments">
      {first ? renderComment(first): false}
      {middle}
      {props.post.omittedComments > 0 ? <MoreCommentsWrapper postId={props.post.id}
                                                             omittedComments={props.post.omittedComments}
                                                             showMoreComments={props.showMoreComments} /> : false}
      {last ? renderComment(last) : false}
    </div>
  )
}
