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
import PostMoreMenu from './post-more-menu'

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

    const recipientCustomDisplay = function(recipient) {
      if (recipient.id !== props.createdBy.id) {
        return false
      }
      if (recipient.username[recipient.username.length - 1] === 's') {
        return recipient.username + "' feed"
      } else {
        return recipient.username + "'s feed"
      }
    }

    let recipients = props.recipients
    // Check if the post has been only submitted to one recipient
    // and if we can omit it
    if (recipients.length === 1) {
      // If the post is in user/group feed (one-source list), we should omit
      // the only recipient, since it would be that feed.
      if (props.isInUserFeed) {
        recipients = []
      } else {
        // When in a many-sources list (Home, Direct messages, My discussions),
        // we should omit the only recipient if it's the author's feed.
        if (recipients[0].id === props.createdBy.id) {
          recipients = []
        }
      }
    }
    recipients = recipients.map((recipient, index) => (
      <span key={index}>
        <UserName
          className="post-recipient"
          user={recipient}
          display={recipientCustomDisplay(recipient)}/>
        {index < props.recipients.length - 2 ? ', ' : false}
        {index === props.recipients.length - 2 ? ' and ' : false}
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
      // The events don't need to be real, just mimic some important parts.
      dragenter: function(e) {
        var dragEnterEvent = new Event('dragenter')
        if (e.dataTransfer && e.dataTransfer.types) {
          dragEnterEvent.dataTransfer = { types: e.dataTransfer.types }
        }
        window.dispatchEvent(dragEnterEvent)
      },
      drop: function(e) {
        var dropEvent = new Event('drop')
        if (e.dataTransfer && e.dataTransfer.types) {
          dropEvent.dataTransfer = { types: e.dataTransfer.types }
        }
        window.dispatchEvent(dropEvent)
      },

      success: function(file, response) {
        // 'attachments' in this response will be an attachment object, not an array of objects
        props.addAttachmentResponse(props.id, response.attachments)
      }
    }

    // "Comments disabled" / "Comment"
    let commentLink
    if (props.commentsDisabled) {
      if (props.isEditable) {
        commentLink = (
          <span>
            <i>Comments disabled (not for you)</i>
            {' - '}
            <a onClick={preventDefault(toggleCommenting)}>Comment</a>
          </span>
        )
      } else {
        commentLink = (
          <i>Comments disabled</i>
        )
      }
    } else {
      commentLink = (
        <a onClick={preventDefault(toggleCommenting)}>Comment</a>
      )
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
            {recipients.length > 0 ? ' to ' : false}
            {recipients}
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
            {commentLink}
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
                <PostMoreMenu
                  toggleEditingPost={toggleEditingPost}
                  deletePost={deletePost}/>
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
