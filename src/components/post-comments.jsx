import React from 'react'
import PostComment from './post-comment'
import MoreCommentsWrapper from './more-comments-wrapper'
import {preventDefault} from '../utils'

const renderComment = (entryUrl, openAnsweringComment, isModeratingComments, commentEdit) => comment => (
  <PostComment
    key={comment.id}
    {...comment}
    entryUrl={entryUrl}
    openAnsweringComment={openAnsweringComment}
    isModeratingComments={isModeratingComments}
    {...commentEdit}/>
)

const renderAddingComment = props => (
  <PostComment
    id={props.post.id}
    key={`${props.post.id}-comment-adding`}
    isEditing={true}
    isSinglePost={props.post.isSinglePost}
    editText={props.post.newCommentText}
    updateCommentingText={props.updateCommentingText}
    saveEditingComment={props.addComment}
    toggleEditingComment={props.toggleCommenting}
    errorString={props.commentError}
    isSaving={props.post.isSavingComment}/>
)

const renderAddCommentLink = (props, disabledForOthers) => {
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
        {disabledForOthers
          ? <i> - disabled for others</i>
          : false}
      </div>
    )
  }

  return false
}

export default (props) => {
  const entryUrl = `/${props.post.createdBy.username}/${props.post.id}`

  const openAnsweringComment = (username) => {
    if (!props.post.isCommenting && !props.post.isSinglePost) {
      props.toggleCommenting(props.post.id)
    }

    const updatedCommentText = `@${username} ` + (props.post.newCommentText || '')
    props.updateCommentingText(props.post.id, updatedCommentText)
  }

  const commentMapper = renderComment(entryUrl, openAnsweringComment, props.post.isModeratingComments, props.commentEdit)
  const first = props.comments[0]
  const last = props.comments.length > 1 && props.comments[props.comments.length - 1]
  const middle = props.comments.slice(1, props.comments.length - 1).map(commentMapper)
  const showOmittedNumber = props.post.omittedComments > 0
  const showMoreComments = () => props.showMoreComments(props.post.id)
  const canAddComment = (!props.post.commentsDisabled || props.post.isEditable)
  const disabledForOthers = (props.post.commentsDisabled && props.post.isEditable)

  return (
    <div className="comments">
      {first ? commentMapper(first): false}
      {middle}
      {showOmittedNumber
        ? <MoreCommentsWrapper
            omittedComments={props.post.omittedComments}
            showMoreComments={showMoreComments}
            entryUrl={entryUrl}
            isLoading={props.post.isLoadingComments}/>
        : false}
      {last ? commentMapper(last) : false}
      {canAddComment
        ? (props.post.isCommenting
            ? renderAddingComment(props)
            : renderAddCommentLink(props, disabledForOthers))
        : false}
    </div>
  )
}
