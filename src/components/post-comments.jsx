import React from 'react'
import PostComment from './post-comment'
import MoreCommentsWrapper from './more-comments-wrapper'
import {preventDefault} from '../utils'

const renderComment = commentEdit => comment => (<PostComment key={comment.id} {...comment} {...commentEdit}/>)

const renderAddingComment = props => (
  <PostComment
    id={props.post.id}
    isEditing={true}
    isSinglePost={props.post.isSinglePost}
    editText={props.post.newCommentText}
    saveEditingComment={props.addComment}
    toggleEditingComment={props.toggleCommenting}
    errorString={props.commentError}
    isSaving={props.post.isSavingComment}/>
)

const renderAddCommentLink = props => {
  const toggleCommenting = props.post.isSinglePost ? () => {} : () => props.toggleCommenting(props.post.id)

  if (props.comments.length > 2 && !props.post.omittedComments /* TODO: && user_is_signed_in */) {
    return (
      <div className="comment">
        <a className="comment-icon fa-stack fa-1x" onClick={preventDefault(toggleCommenting)}>
          <i className="fa fa-comment-o fa-stack-1x"></i>
          <i className="fa fa-square fa-inverse fa-stack-1x"></i>
          <i className="fa fa-plus fa-stack-1x"></i>
        </a>
        <a className="add-comment-link" onClick={preventDefault(toggleCommenting)}>Add comment</a>
      </div>
    )
  }

  return false
}

export default (props) => {
  const commentMapper = renderComment(props.commentEdit)
  const first = props.comments[0]
  const last = props.comments.length > 1 && props.comments[props.comments.length - 1]
  const middle = props.comments.slice(1, props.comments.length - 1).map(commentMapper)
  const showOmittedNumber = props.post.omittedComments > 0
  const showMoreComments = () => props.showMoreComments(props.post.id)
  const canAddComment = (!props.post.commentsDisabled || props.post.isEditable)

  return (
    <div className="comments">
      {first ? commentMapper(first): false}
      {middle}
      {showOmittedNumber
        ? <MoreCommentsWrapper
            omittedComments={props.post.omittedComments}
            showMoreComments={showMoreComments}
            isLoading={props.post.isLoadingComments}/>
        : false}
      {last ? commentMapper(last) : false}
      {canAddComment
        ? (props.post.isCommenting
            ? renderAddingComment(props)
            : renderAddCommentLink(props))
        : false}
    </div>
  )
}
