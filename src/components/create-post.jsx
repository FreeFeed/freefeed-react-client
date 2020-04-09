/* global CONFIG */
import React from 'react';
import Textarea from 'react-textarea-autosize';
import _ from 'lodash';

import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { preventDefault } from '../utils';
import { submitByEnter } from '../utils/submit-by-enter';
import SendTo from './send-to';
import Dropzone from './dropzone';
import PostAttachments from './post-attachments';
import ErrorBoundary from './error-boundary';
import { Throbber } from './throbber';
import { Icon } from './fontawesome-icons';

const attachmentsMaxCount = CONFIG.attachments.maxCount;

const isTextEmpty = (text) => text == '' || /^\s+$/.test(text);
const getDefaultState = (invitation = '') => ({
  isFormEmpty: true,
  isMoreOpen: false,
  postText: invitation,
  commentsDisabled: false,
  attLoading: false,
  attachments: [],
  dropzoneDisabled: false,
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
    const { postText, attachments } = this.state;
    const attachmentIds = attachments.map((attachment) => attachment.id);
    const more = { commentsDisabled: this.state.commentsDisabled };

    // Send to the server
    this.props.createPost(feeds, postText, attachmentIds, more);
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    const wasCommentJustSaved =
      this.props.createPostViewState.isPending && !newProps.createPostViewState.isPending;
    const wasThereNoError = !newProps.createPostViewState.isError;
    const shouldClear = wasCommentJustSaved && wasThereNoError;
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
            makeJpegIfNeeded(blob).then((blob) => this.dropzoneObject.addFile(blob));
          }
        }
      }
    }
  };

  clearForm = () => {
    this.selectFeeds && this.selectFeeds.reset();
    this.setState(getDefaultState());
  };

  removeAttachment = (attachmentId) => {
    const attachments = this.state.attachments.filter((a) => a.id !== attachmentId);
    const dropzoneDisabled = attachments.length >= attachmentsMaxCount;

    if (!dropzoneDisabled && this.state.dropzoneDisabled) {
      this.dropzoneObject.enable();
    }

    this.setState({ attachments, dropzoneDisabled });
  };

  reorderImageAttachments = (attachmentIds) => {
    const oldIds = this.state.attachments.map((a) => a.id);
    const newIds = _.uniq(attachmentIds.concat(oldIds));
    const attachments = newIds
      .map((id) => this.state.attachments.find((a) => a.id === id))
      .filter(Boolean);
    this.setState({ attachments });
  };

  checkCreatePostAvailability = () => {
    const isFormEmpty =
      isTextEmpty(this.state.postText) || !this.selectFeeds || this.selectFeeds.values === 0;

    this.setState({ isFormEmpty });
  };

  onPostTextChange = (e) => {
    this.setState({ postText: e.target.value }, this.checkCreatePostAvailability);
  };

  attLoadingStarted = () => this.setState({ attLoading: true });
  attLoadingCompleted = () => this.setState({ attLoading: false });

  checkSave = submitByEnter(() => this.canSubmitForm() && this.createPost());

  toggleMore = () => {
    this.setState({ isMoreOpen: !this.state.isMoreOpen });
  };

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  handleAddAttachmentResponse = (att) => {
    if (this.state.attachments.length >= attachmentsMaxCount) {
      return;
    }

    const attachments = [...this.state.attachments, att];
    const dropzoneDisabled = attachments.length >= attachmentsMaxCount;

    if (dropzoneDisabled && !this.state.dropzoneDisabled) {
      this.dropzoneObject.removeAllFiles(true);
      this.dropzoneObject.disable();
    }

    this.setState({ attachments, dropzoneDisabled });
  };

  handleChangeOfMoreCheckbox = (e) => {
    this.setState({ commentsDisabled: e.target.checked });
  };

  registerSelectFeeds = (el) => (this.selectFeeds = el);

  canSubmitForm = () => {
    return (
      !this.state.isFormEmpty &&
      !this.state.attLoading &&
      !this.props.createPostViewState.isPending &&
      this.selectFeeds &&
      this.selectFeeds.values.length > 0 &&
      !this.selectFeeds.isIncorrectDestinations
    );
  };

  render() {
    return (
      <div className="create-post post-editor">
        <ErrorBoundary>
          <div>
            {this.props.sendTo.expanded && (
              <SendTo
                ref={this.registerSelectFeeds}
                defaultFeed={this.props.sendTo.defaultFeed}
                isDirects={this.props.isDirects}
                user={this.props.user}
                onChange={this.checkCreatePostAvailability}
              />
            )}

            <Dropzone
              onInit={this.handleDropzoneInit}
              addAttachmentResponse={this.handleAddAttachmentResponse}
              onSending={this.attLoadingStarted}
              onQueueComplete={this.attLoadingCompleted}
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
            <span
              className="post-edit-attachments dropzone-trigger"
              disabled={this.state.dropzoneDisabled}
            >
              <Icon icon={faCloudUploadAlt} className="upload-icon" /> Add photos or files
            </span>

            <a className="post-edit-more-trigger" onClick={this.toggleMore}>
              More&nbsp;&#x25be;
            </a>

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
            ) : (
              false
            )}
          </div>

          <div className="post-edit-actions">
            {this.props.createPostViewState.isPending ? (
              <span className="throbber">
                <Throbber />
              </span>
            ) : (
              false
            )}

            <button
              className="btn btn-default btn-xs"
              onClick={preventDefault(this.createPost)}
              disabled={!this.canSubmitForm()}
            >
              Post
            </button>
          </div>

          {this.state.dropzoneDisabled && (
            <div className="alert alert-warning">
              The maximum number of attached files ({attachmentsMaxCount}) has been reached
            </div>
          )}

          {this.props.createPostViewState.isError ? (
            <div className="alert alert-danger">{this.props.createPostViewState.errorString}</div>
          ) : (
            false
          )}

          <PostAttachments
            attachments={this.state.attachments}
            isEditing={true}
            removeAttachment={this.removeAttachment}
            reorderImageAttachments={this.reorderImageAttachments}
            showMedia={this.props.showMedia}
          />

          <div className="dropzone-previews" />
        </ErrorBoundary>
      </div>
    );
  }
}

/**
 * Convert 'image/png' blob to 'image/jpeg' blob if:
 * 1) The PNG size is more than 50 KiB and
 * 2) JPEG size is less than half the PNG size.
 *
 * The returning promise is never failed and returns
 * either JPEG or the original PNG.
 *
 * @param {Blob} blob
 * @returns {Promise<Blob>}
 */
export async function makeJpegIfNeeded(blob) {
  if (blob.type !== 'image/png' || blob.size < 50 * 1024) {
    return blob;
  }

  const src = window.URL.createObjectURL(blob);
  try {
    const image = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Cannot load image'));
      image.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    jpeg.name = blob.name.replace(/\.png$/, '.jpg');

    if (jpeg.size < blob.size / 2) {
      return jpeg;
    }
  } catch (e) {
    // skip any errors
  } finally {
    window.URL.revokeObjectURL(src);
  }
  return blob;
}
