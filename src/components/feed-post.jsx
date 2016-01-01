import React from 'react'
import {Link} from 'react-router'
import moment from 'moment'
import classnames from 'classnames'

import {fromNowOrNow} from '../utils'
import PostAttachments from './post-attachments'
import PostComments from './post-comments'
import PostLikes from './post-likes'
import UserName from './user-name'
import {preventDefault} from '../utils'
import PieceOfText from './piece-of-text'
import Textarea from 'react-textarea-autosize'
import throbber16 from 'assets/images/throbber-16.gif'
import DropzoneComponent from 'react-dropzone-component'
import {api as apiConfig} from '../config'
import {getToken} from '../services/auth'

export default class FeedPost extends React.Component {
  render() {
    let props = this.props

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
      if (!props.isSaving) {
        let attachmentIds = props.attachments.map(item => item.id) || []
        props.saveEditingPost(props.id, {body: editingPostText, attachments: attachmentIds})
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
    const ILikedPost = _.find(props.usersLikedPost, {id: props.user.id})
    const profilePicture = props.isSinglePost ?
      props.createdBy.profilePictureLargeUrl : props.createdBy.profilePictureMediumUrl
    const postClass = classnames({
      'post': true,
      'single-post': props.isSinglePost,
      'timeline-post': !props.isSinglePost,
      'direct-post': props.isDirect
    })

    const toggleCommenting = props.isSinglePost ? () => {
    } : () => props.toggleCommenting(props.id)

    const directReceivers = props.directReceivers.map((receiver, index) => (
      <span key={index}>
        <UserName className="post-addressee post-addressee-direct" user={receiver}/>
        {index !== props.directReceivers.length - 1 ? ',' : false}
      </span>
    ))

    // DropzoneJS configuration
    const dropzoneComponentConfig = {
      postUrl: `${apiConfig.host}/v1/attachments`
    }
    const dropzoneConfig = {
      dictDefaultMessage: 'Drop files here', // The message that gets displayed before any files are dropped.
      previewsContainer: '.dropzone-previews', // Define the container to display the previews.
      clickable: '.dropzone-trigger', // Define the element that should be used as click trigger to select files.
      headers: {
        'Cache-Control': null,
        'X-Authentication-Token': getToken()
      }
    }
    const dropzoneEventHandlers = {
      // DropzoneJS uses stopPropagation() for dragenter and drop events, so
      // they are not being propagated to window and it breaks crafty handling
      // of those events we have in the Layout component. So here we have to
      // re-dispatch them to let event handlers in Layout work as they should.
      dragenter: function() {
        var dragEnterEvent = new DragEvent('dragenter')
        window.dispatchEvent(dragEnterEvent)
      },
      drop: function() {
        var dropEvent = new DragEvent('drop')
        window.dispatchEvent(dropEvent)
      },

      success: function(file, response) {
        // 'attachments' in this response will be an attachment object, not an array of objects
        props.addAttachmentResponse(props.id, response.attachments)
      }
    }

    return (
      <div className={postClass}>
        <div className="post-userpic">
          <Link to={`/${props.createdBy.username}`}>
            <img src={profilePicture}/>
          </Link>
        </div>
        <div className="post-body">
          <div className="post-header">
            <UserName className="post-author" user={props.createdBy}/>
            {props.isDirect ? (<span>&nbsp;to&nbsp;</span>) : false}
            {props.isDirect ? directReceivers : false}
          </div>

          {props.isEditing ? (
            <div className="post-editor">
              <DropzoneComponent
                config={dropzoneComponentConfig}
                djsConfig={dropzoneConfig}
                eventHandlers={dropzoneEventHandlers}/>

              <div>
                <Textarea
                  className="post-textarea"
                  defaultValue={props.editingText}
                  onKeyDown={checkSave}
                  onChange={editingPostTextChange}
                  minRows={2}
                  maxRows={10}/>
              </div>

              <div className="post-edit-attachments dropzone-trigger">
                <i className="fa fa-cloud-upload"></i>
                {' '}
                Add photos or files
              </div>

              <div className="post-edit-actions">
                {props.isSaving ? (
                  <span className="post-edit-throbber">
                    <img width="16" height="16" src={throbber16}/>
                  </span>
                ) : false}
                <a className="post-cancel" onClick={preventDefault(cancelEditingPost)}>Cancel</a>
                <button className="btn btn-default btn-xs" onClick={preventDefault(saveEditingPost)}>Update</button>
              </div>
            </div>
          ) : (
            <div className="post-text">
              <PieceOfText text={props.body}/>
            </div>
          )}

          <PostAttachments attachments={props.attachments}/>

          <div className="dropzone-previews"></div>

          <div className="post-footer">
            {props.isDirect ? (<span>»&nbsp;</span>) : false}
            <Link to={`/${props.createdBy.username}/${props.id}`} className="post-timestamp">
              <time dateTime={createdAtISO} title={createdAtISO}>{createdAgo}</time>
            </Link>
            {' - '}
            <a onClick={preventDefault(toggleCommenting)}>Comment</a>
            {' - '}
            <a onClick={preventDefault(ILikedPost ? unlikePost : likePost)}>{ILikedPost ? 'Un-like' : 'Like'}</a>
            {props.isLiking ? (
              <span className="post-like-throbber">
                <img width="16" height="16" src={throbber16}/>
              </span>
            ) : false}
            {props.isEditable ? (
              <span>
                {' - '}
                <a onClick={preventDefault(toggleEditingPost)}>Edit</a>
                {' - '}
                <a onClick={preventDefault(deletePost)}>Delete</a>
              </span>
            ) : false}
          </div>

          {props.isError ? (
            <div className='post-error'>
              {props.errorString}
            </div>
          ) : false}

          <PostLikes
            post={props}
            likes={props.usersLikedPost}
            showMoreLikes={props.showMoreLikes}/>

          <PostComments
            post={props}
            comments={props.comments}
            creatingNewComment={props.isCommenting}
            addComment={props.addComment}
            toggleCommenting={props.toggleCommenting}
            showMoreComments={props.showMoreComments}
            commentEdit={props.commentEdit}/>
        </div>
      </div>
    )
  }
}
