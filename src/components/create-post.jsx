import React from 'react';
import Textarea from 'react-textarea-autosize';

import throbber from '../../assets/images/throbber.gif';
import { preventDefault } from '../utils';
import SendTo from './send-to';
import Dropzone from './dropzone';
import PostAttachments from './post-attachments';

const isTextEmpty = (text) => text == '' || /^\s+$/.test(text);
const getDefaultState = (invitation = '') => ({
  isFormEmpty:           true,
  isMoreOpen:            false,
  attachmentQueueLength: 0,
  postText:              invitation,
  commentsDisabled:      false,
});

export default class CreatePost extends React.Component {
  selectFeeds;

  constructor(props) {
    super(props);
    this.state = getDefaultState(props.sendTo.invitation);
  }

  createPost = () => {
    // Get all the values
    const feeds = this.selectFeeds.values;
    const { postText } = this.state;
    const attachmentIds = this.props.createPostForm.attachments.map((attachment) => attachment.id);
    const more = { commentsDisabled: this.state.commentsDisabled };

    // Send to the server
    this.props.createPost(feeds, postText, attachmentIds, more);
  };

  componentWillReceiveProps(newProps) {
    const wasCommentJustSaved = this.props.createPostViewState.isPending && !newProps.createPostViewState.isPending;
    const wasThereNoError = !newProps.createPostViewState.isError;
    const shouldClear = (wasCommentJustSaved && wasThereNoError);
    if (shouldClear) {
      this.clearForm();
    }
    if (this.props.sendTo.invitation !== newProps.sendTo.invitation) {
      this.setState({ postText: newProps.sendTo.invitation });
    }
  }

  //
  // Handling attachments

  handleDropzoneInit = (d) => {
    this.dropzoneObject = d;
  };

  handlePaste = (e) => {
    if (e.clipboardData) {
      const { items } = e.clipboardData;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image/') > -1) {
            const blob = items[i].getAsFile();
            if (!blob.name) {
              blob.name = 'image.png';
            }
            this.dropzoneObject.addFile(blob);
          }
        }
      }
    }
  };

  clearForm = () => {
    this.setState(getDefaultState());
    const attachmentIds = this.props.createPostForm.attachments.map((attachment) => attachment.id);
    attachmentIds.forEach(this.removeAttachment);
  };

  removeAttachment = (attachmentId) => this.props.removeAttachment(null, attachmentId);

  checkCreatePostAvailability = () => {
    const isFormEmpty = isTextEmpty(this.state.postText) || this.selectFeeds.values === 0;

    this.setState({ isFormEmpty });
  };

  onPostTextChange = (e) => {
    this.setState({ postText: e.target.value }, this.checkCreatePostAvailability);
  };

  checkSave = (e) => {
    const isEnter = e.keyCode === 13;
    const isShiftPressed = e.shiftKey;
    if (isEnter && !isShiftPressed) {
      e.preventDefault();
      if (!this.state.isFormEmpty && this.state.attachmentQueueLength === 0 && !this.props.createPostViewState.isPending) {
        this.createPost();
      }
    }
  };

  toggleMore = () => {
    this.setState({ isMoreOpen: !this.state.isMoreOpen });
  };

  changeAttachmentQueue = (change) => () => {
    this.setState({ attachmentQueueLength: this.state.attachmentQueueLength + change });
  };

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  handleAddAttachmentResponse = (att) => {
    this.props.addAttachmentResponse(null, att);
  };

  handleChangeOfMoreCheckbox = (e) => {
    this.setState({ commentsDisabled: e.target.checked });
  };

  registerSelectFeeds = (el) => {
    // SendTo is a redux-connected component so we need to use getWrappedInstance
    this.selectFeeds = el ? el.getWrappedInstance() : null;
  };

  canSubmitForm = () => {
    return !this.state.isFormEmpty
      && this.state.attachmentQueueLength == 0
      && !this.props.createPostViewState.isPending
      && !this.selectFeeds.isIncorrectDestinations;
  };

  render() {
    return (
      <div className="create-post post-editor">
        <div>
          {this.props.sendTo.expanded &&
            <SendTo
              ref={this.registerSelectFeeds}
              defaultFeed={this.props.sendTo.defaultFeed}
              isDirects={this.props.isDirects}
              user={this.props.user}
              onChange={this.checkCreatePostAvailability}
            />
          }

          <Dropzone
            onInit={this.handleDropzoneInit}
            addAttachmentResponse={this.handleAddAttachmentResponse}
            addedFile={this.changeAttachmentQueue(1)}
            removedFile={this.changeAttachmentQueue(-1)}
          />

          <Textarea
            className="post-textarea"
            value={this.state.postText}
            onChange={this.onPostTextChange}
            onFocus={this.props.expandSendTo}
            onKeyDown={this.checkSave}
            onPaste={this.handlePaste}
            minRows={3}
            maxRows={10}
            maxLength="1500"
          />
        </div>

        <div className="post-edit-options">
          <span className="post-edit-attachments dropzone-trigger">
            <i className="fa fa-cloud-upload" />
            {' '}
            Add photos or files
          </span>

          <a className="post-edit-more-trigger" onClick={this.toggleMore}>More&nbsp;&#x25be;</a>

          {this.state.isMoreOpen ? (
            <div className="post-edit-more">
              <label>
                <input
                  className="post-edit-more-checkbox"
                  type="checkbox"
                  value={this.state.commentsDisabled}
                  onChange={this.handleChangeOfMoreCheckbox}
                />
                <span className="post-edit-more-labeltext">Comments disabled</span>
              </label>
            </div>
          ) : false}
        </div>

        <div className="post-edit-actions">
          {this.props.createPostViewState.isPending ? (
            <span className="throbber">
              <img width="16" height="16" src={throbber} />
            </span>
          ) : false}

          <button
            className="btn btn-default btn-xs"
            onClick={preventDefault(this.createPost)}
            disabled={!this.canSubmitForm()}
          >
            Post
          </button>
        </div>

        <PostAttachments
          attachments={this.props.createPostForm.attachments}
          isEditing={true}
          removeAttachment={this.removeAttachment}
        />

        <div className="dropzone-previews" />

        {this.props.createPostViewState.isError ? (
          <div className="create-post-error">
            {this.props.createPostViewState.errorString}
          </div>
        ) : false}
      </div>
    );
  }
}
