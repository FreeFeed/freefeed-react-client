/* global CONFIG */
import { Component, createRef } from 'react';
import _ from 'lodash';
import * as Sentry from '@sentry/react';

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { preventDefault } from '../utils';
import { makeJpegIfNeeded } from '../utils/jpeg-if-needed';
import { SubmitModeHint } from './submit-mode-hint';
import SendTo from './send-to';
import Dropzone from './dropzone';
import PostAttachments from './post/post-attachments';
import ErrorBoundary from './error-boundary';
import { Throbber } from './throbber';
import { Icon } from './fontawesome-icons';
import { ButtonLink } from './button-link';
import { MoreWithTriangle } from './more-with-triangle';
import { SubmittableTextarea } from './mention-textarea';

const attachmentsMaxCount = CONFIG.attachments.maxCount;

const getDefaultState = (invitation = '') => ({
  isFormEmpty: true,
  isMoreOpen: false,
  postText: invitation,
  commentsDisabled: false,
  attLoading: false,
  attachments: [],
  dropzoneDisabled: false,
});

export default class CreatePost extends Component {
  selectFeeds;

  constructor(props) {
    super(props);
    this.state = getDefaultState(props.sendTo.invitation);
    this.textareaRef = createRef();
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

  componentDidUpdate(prevProps) {
    const wasPostJustSaved =
      prevProps.createPostViewState.isPending && !this.props.createPostViewState.isPending;
    const wasThereNoError = !this.props.createPostViewState.isError;
    const shouldClear = wasPostJustSaved && wasThereNoError;
    if (shouldClear) {
      this.clearForm();
    }
    if (prevProps.sendTo.invitation !== this.props.sendTo.invitation) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ postText: this.props.sendTo.invitation });
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
        for (const item of items) {
          if (item.type.includes('image/')) {
            const blob = item.getAsFile();
            if (!blob.name) {
              blob.name = 'image.png';
            }
            makeJpegIfNeeded(blob)
              .then((blob) => this.dropzoneObject.addFile(blob))
              .catch((error) => {
                Sentry.captureException(error, {
                  level: 'error',
                  tags: { area: 'upload' },
                });
              });
          }
        }
      }
    }
  };

  clearForm = () => {
    this.selectFeeds && this.selectFeeds.reset();
    this.setState(getDefaultState());
    this.removeFocusFromTextarea();
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
      this.state.postText.trim() === '' || !this.selectFeeds || this.selectFeeds.values === 0;

    this.setState({ isFormEmpty });
  };

  onPostTextChange = (e) => {
    this.setState({ postText: e }, this.checkCreatePostAvailability);
  };

  attLoadingStarted = () => this.setState({ attLoading: true });
  attLoadingCompleted = () => this.setState({ attLoading: false });

  checkSave = () => this.canSubmitForm() && this.createPost();

  removeFocusFromTextarea = () => {
    this.textareaRef.current?.blur();
  };

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
    this.props.expandSendTo();
  };

  handleChangeOfMoreCheckbox = (e) => {
    this.setState({ commentsDisabled: e.target.checked });
  };

  registerSelectFeeds = (el) => (this.selectFeeds = el);

  canSubmitForm = () => {
    return (
      (!this.state.isFormEmpty || this.state.attachments.length > 0) &&
      !this.state.attLoading &&
      !this.props.createPostViewState.isPending &&
      this.selectFeeds &&
      this.selectFeeds.values.length > 0 &&
      !this.selectFeeds.isIncorrectDestinations
    );
  };

  render() {
    return (
      <div className="create-post post-editor" role="form" aria-label="Write a post">
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

            <SubmittableTextarea
              ref={this.textareaRef}
              className="post-textarea"
              value={this.state.postText}
              onChange={this.onPostTextChange}
              onFocus={this.props.expandSendTo}
              onSubmit={this.checkSave}
              onPaste={this.handlePaste}
              minRows={3}
              maxRows={10}
              maxLength={CONFIG.maxLength.post}
              dir={'auto'}
            />
          </div>

          <div className="post-edit-actions">
            <div className="post-edit-options">
              <span
                className="post-edit-attachments dropzone-trigger"
                disabled={this.state.dropzoneDisabled}
                role="button"
              >
                <Icon icon={faPaperclip} className="upload-icon" /> Add photos or files
              </span>

              <ButtonLink className="post-edit-more-trigger" onClick={this.toggleMore}>
                <MoreWithTriangle />
              </ButtonLink>

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

            <SubmitModeHint input={this.textareaRef} className="post-edit-hint" />

            <div className="post-edit-buttons">
              {this.props.createPostViewState.isPending && (
                <span className="throbber">
                  <Throbber />
                </span>
              )}
              <button
                className="btn btn-default btn-xs"
                onClick={preventDefault(this.createPost)}
                disabled={!this.canSubmitForm()}
              >
                Post
              </button>
            </div>
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
