import React from 'react'
import {preventDefault} from '../utils'
import Textarea from 'react-textarea-autosize'
import throbber from 'assets/images/throbber.gif'
import SendTo from './send-to'
import DropzoneComponent from 'react-dropzone-component'
import {api as apiConfig} from '../config'
import {getToken} from '../services/auth'
import PostAttachments from './post-attachments'

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      disabled: true
    }
  }

  createPost = _ => {
    let postText = this.refs.postText.value
    let feeds = this.refs.selectFeeds.values
    let attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id)

    this.props.createPost(postText, feeds, attachmentIds)

    this.refs.postText.value = ''
    this.setState({
      disabled: true
    })
  }

  isPostTextEmpty = (postText) => {
    return postText == '' || /^\s+$/.test(postText)
  }

  checkCreatePostAvailability = (e) => {
    let isPostDisabled = this.isPostTextEmpty(this.refs.postText.value)
                      || this.refs.selectFeeds.values == 0

    this.setState({
      disabled: (isPostDisabled)
    })
  }

  checkSave = (e) => {
    const isEnter = e.keyCode === 13
    const isShiftPressed = e.shiftKey
    if (isEnter && !isShiftPressed) {
      e.preventDefault()
      if (!this.state.disabled && !this.props.createPostViewState.isPending){
        this.createPost()
      }
    }
  }

  render() {
    let props = this.props

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
        props.addAttachmentResponse(null, response.attachments)
      }
    }

    return (
      <div className="create-post post-editor">
        <div>
          {this.props.sendTo.expanded ? (
            <SendTo ref="selectFeeds"
              feeds={this.props.sendTo.feeds}
              user={this.props.user}
              onChange={this.checkCreatePostAvailability}/>
          ) : false}

          <DropzoneComponent
            config={dropzoneComponentConfig}
            djsConfig={dropzoneConfig}
            eventHandlers={dropzoneEventHandlers}/>

          <Textarea
            className="post-textarea"
            ref="postText"
            onChange={this.checkCreatePostAvailability}
            minRows={3}
            maxRows={10}
            onKeyDown={this.checkSave}
            onFocus={this.props.expandSendTo}/>
        </div>

        <div className="post-edit-attachments dropzone-trigger">
          <i className="fa fa-cloud-upload"></i>
          {' '}
          Add photos or files
        </div>

        <div className="post-edit-actions">
          {this.props.createPostViewState.isPending ? (
            <span className="throbber">
              <img width="16" height="16" src={throbber}/>
            </span>
          ) : false}

          <button className="btn btn-default btn-xs"
            onClick={preventDefault(this.createPost)}
            disabled={this.state.disabled || this.props.createPostViewState.isPending}>Post</button>
        </div>

        <PostAttachments attachments={this.props.createPostForm.attachments}/>

        <div className="dropzone-previews"></div>

        {this.props.createPostViewState.isError ? (
          <div className="create-post-error">
            {this.props.createPostViewState.errorString}
          </div>
        ) : false}
      </div>
    )
  }
}
