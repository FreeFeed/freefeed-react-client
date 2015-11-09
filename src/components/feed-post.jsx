import React from 'react'
import {Link} from 'react-router'
import moment from 'moment'

import {fromNowOrNow} from '../utils'
import PostAttachments from './post-attachments'
import PostComments from './post-comments'
import PostLikes from './post-likes'
import UserName from './user-name'
import {preventDefault} from '../utils'
import PostText from './post-text'
import Textarea from 'react-textarea-autosize'
import throbber from 'assets/images/throbber.gif'

export default (props) => {
  const isDirect = false

  const createdAt = new Date(props.createdAt - 0)
  const createdAtISO = moment(createdAt).format()
  const createdAgo = fromNowOrNow(createdAt)

  let editingPostText = props.editingText
  let editingPostTextChange = (e) => {
    editingPostText = e.target.value
  }
  const toggleEditingPost = () => props.toggleEditingPost(props.id, editingPostText)
  const cancelEditingPost = () => props.cancelEditingPost(props.id, editingPostText)
  const saveEditingPost = () => {
    if (!props.isSaving){
      props.saveEditingPost(props.id, { body: editingPostText })
    }
  }
  const deletePost = () => props.deletePost(props.id)
  const likePost = () => props.likePost(props.id, props.user.id)
  const unlikePost = () => props.unlikePost(props.id, props.user.id)
  const checkSave = (event) => {
    const isEnter = event.keyCode === 13
    if (isEnter) {
      event.preventDefault()
      saveEditingPost()
    }
  }
  const ILikedPost = _.find(props.usersLikedPost, {id:props.user.id})
  const profilePicture = props.isSinglePost ?
    props.createdBy.profilePictureLargeUrl : props.createdBy.profilePictureMediumUrl
  const postClass = props.isSinglePost ?
    'single-post-container' : 'timeline-post-container'
  const toggleCommenting = props.isSinglePost ? () => {} : () => props.toggleCommenting(props.id)

  return (
    <div className={postClass}>
      <div className='avatar'>
        <Link to='timeline.index' params={{username: props.createdBy.username}}>
          <img src={ profilePicture } />
        </Link>
      </div>
      <div className='post-body p-timeline-post'>
        <div className='title'>
          <UserName className='post-author' user={props.createdBy}/>
        </div>

        {props.isEditing ? (
          <div className='edit-post'>
            <div>
              <Textarea className='edit-post-area'
                        defaultValue={props.editingText}
                        onKeyDown={checkSave}
                        onChange={editingPostTextChange}
                        minRows={2}
                        maxRows={10}/>
            </div>
            <div className='post-actions'>
              {props.isSaving ? (
                  <span className="throbber">
                    <img width="16" height="16" src={throbber}/>
                  </span>
                ) : false}
              <a className="action-link post-cancel" onClick={preventDefault(cancelEditingPost)}>Cancel</a>
              <button className='btn btn-default btn-xs'
                      onClick={preventDefault(saveEditingPost)}>
                Update
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className='body'>
              <div className='text'>
                <PostText text={props.body}/>
              </div>
            </div>

            <PostAttachments attachments={props.attachments} />

            <div className='info p-timeline-post-info'>
              {isDirect ? (<span>»</span>) : false}
              <span className='post-date'>
                <Link to={`/${props.createdBy.username}/${props.id}`} className='datetime'>
                  <time dateTime={createdAtISO} title={createdAtISO}>{createdAgo}</time>
                </Link>
              </span>

              <span className='post-controls'>
                <span>
                  <span>&nbsp;-&nbsp;</span>
                  <a className='p-timeline-post-comment-action' onClick={preventDefault(toggleCommenting)}>
                    Comment
                  </a>
                  <span>&nbsp;-&nbsp;</span>
                  <a className='p-timeline-post-comment-action' onClick={preventDefault(ILikedPost ? unlikePost : likePost)}>
                    {ILikedPost ? 'Un-like' : 'Like'}
                  </a>
                </span>
                {props.isEditable ? (
                  <span>
                    <span>&nbsp;-&nbsp;</span>
                    <a className='p-timeline-post-comment-action' onClick={preventDefault(toggleEditingPost)}>
                      Edit
                    </a>
                    <span>&nbsp;-&nbsp;</span>
                    <a className='p-timeline-post-comment-action' onClick={preventDefault(deletePost)}>
                      Delete
                    </a>
                  </span>
                ) : false}
              </span>
            </div>
          </div>
        )}

        <div className='info p-timeline-post-info'>
          <PostLikes post={props} likes={props.usersLikedPost} showMoreLikes={props.showMoreLikes} />
        </div>

        {props.isError ? (
          <div className='post-error'>
            {props.errorString}
          </div>
        ) : false}

        <PostComments post={props}
                      comments={props.comments}
                      creatingNewComment={props.isCommenting}
                      addComment={props.addComment}
                      toggleCommenting={props.toggleCommenting}
                      showMoreComments={props.showMoreComments}
                      commentEdit={props.commentEdit} />
      </div>
    </div>
  )
}
