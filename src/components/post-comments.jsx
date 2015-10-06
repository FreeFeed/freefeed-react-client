import React from 'react'
import PostComment from './post-comment'
import MoreCommentsWrapper from './more-comments-wrapper'

const renderComment = commentEdit => comment => (<PostComment key={comment.id} {...comment} {...commentEdit}/>)
const renderAddingComment = props => (<PostComment
  id={props.post.id}
  isEditing={true}
  editText={props.post.newCommentText}
  saveEditingComment={props.addComment}
  toggleEditingComment={props.toggleCommenting}
  errorString={props.commentError}/>)

export default (props) => {
  const commentMapper = renderComment(props.commentEdit)
  const first = props.comments[0]
  const last = props.comments.length > 1 && props.comments[props.comments.length - 1]
  const middle = props.comments.slice(1, props.comments.length - 1).map(commentMapper)
  const showMoreComments = () => props.showMoreComments(props.post.id)

  return (
    <div className="comments">
      {first ? commentMapper(first): false}
      {middle}
      {props.post.omittedComments > 0 ? <MoreCommentsWrapper omittedComments={props.post.omittedComments}
                                                             showMoreComments={showMoreComments} /> : false}
      {last ? commentMapper(last) : false}
      {props.post.isCommenting ? renderAddingComment(props): false}
    </div>
  )
}
