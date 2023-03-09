/* global CONFIG */
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { uniq } from 'lodash';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, resetPostCreateForm } from '../redux/action-creators';
import { ButtonLink } from './button-link';
import Dropzone from './dropzone';
import ErrorBoundary from './error-boundary';
import { Icon } from './fontawesome-icons';
import { MoreWithTriangle } from './more-with-triangle';
import PostAttachments from './post/post-attachments';
import SendTo from './send-to';
import { SmartTextarea } from './smart-textarea';
import { SubmitModeHint } from './submit-mode-hint';
import { Throbber } from './throbber';

const attachmentsMaxCount = CONFIG.attachments.maxCount;

export default function CreatePost({ sendTo, expandSendTo, user, showMedia, isDirects }) {
  const dispatch = useDispatch();
  const createPostStatus = useSelector((state) => state.createPostStatus);

  const selectFeeds = useRef();
  const textareaRef = useRef();
  const [dropzoneObject, setDropzoneObject] = useState(null);

  // State
  const [dropzoneDisabled, setDropzoneDisabled] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isFormEmpty, setIsFormEmpty] = useState(true);
  const [attLoading, setAttLoading] = useState(false);
  const [postText, setPostText] = useState(sendTo.invitation || '');
  const [attachments, setAttachments] = useState([]);

  const handleFile = useCallback((file) => dropzoneObject.addFile(file), [dropzoneObject]);

  const handleAddAttachmentResponse = useCallback(
    (att) => {
      if (attachments.length >= attachmentsMaxCount) {
        return;
      }

      const newAttachments = [...attachments, att];
      const dropzoneDisabled = newAttachments.length >= attachmentsMaxCount;

      if (dropzoneDisabled && !dropzoneDisabled) {
        dropzoneObject.removeAllFiles(true);
        dropzoneObject.disable();
      }

      setAttachments(newAttachments);
      setDropzoneDisabled(dropzoneDisabled);

      expandSendTo();
    },
    [attachments, dropzoneObject, expandSendTo],
  );

  const removeAttachment = useCallback(
    (attachmentId) => {
      const newAttachments = attachments.filter((a) => a.id !== attachmentId);
      const newDropzoneDisabled = newAttachments.length >= attachmentsMaxCount;

      if (!newDropzoneDisabled && dropzoneDisabled) {
        dropzoneObject.enable();
      }

      setAttachments(newAttachments);
      setDropzoneDisabled(newDropzoneDisabled);
    },
    [attachments, dropzoneDisabled, dropzoneObject],
  );

  const reorderImageAttachments = useCallback(
    (attachmentIds) => {
      const oldIds = attachments.map((a) => a.id);
      const newIds = uniq(attachmentIds.concat(oldIds));
      const newAttachments = newIds
        .map((id) => attachments.find((a) => a.id === id))
        .filter(Boolean);
      setAttachments(newAttachments);
    },
    [attachments],
  );

  const attLoadingStarted = useCallback(() => setAttLoading(true), []);
  const attLoadingCompleted = useCallback(() => setAttLoading(false), []);

  const canSubmitForm = useMemo(() => {
    return (
      (!isFormEmpty || attachments.length > 0) &&
      !attLoading &&
      !createPostStatus.loading &&
      selectFeeds.current &&
      selectFeeds.current.values.length > 0 &&
      !selectFeeds.current.isIncorrectDestinations
    );
  }, [attLoading, attachments.length, createPostStatus.loading, isFormEmpty]);

  const doCreatePost = useCallback(
    (e) => {
      if (!canSubmitForm) {
        return;
      }

      if (e && e.preventDefault) {
        e.preventDefault();
      }

      // Get all the values
      const feeds = selectFeeds.current.values;
      const attachmentIds = attachments.map((attachment) => attachment.id);
      const more = { commentsDisabled };

      // Send to the server
      dispatch(createPost(feeds, postText, attachmentIds, more));
    },
    [attachments, canSubmitForm, commentsDisabled, dispatch, postText],
  );

  const toggleMore = useCallback(() => setIsMoreOpen((x) => !x), []);
  const handleChangeOfMoreCheckbox = useCallback((e) => setCommentsDisabled(e.target.checked), []);

  const checkCreatePostAvailability = useCallback(
    () =>
      setIsFormEmpty(
        postText.trim() === '' || !selectFeeds.current || selectFeeds.current.values.length === 0,
      ),
    [postText],
  );

  const onPostTextChange = useCallback(
    (text) => {
      setPostText(text);
      checkCreatePostAvailability();
    },
    [checkCreatePostAvailability],
  );

  useEffect(() => {
    // Reset form on success
    if (createPostStatus.success) {
      selectFeeds.current?.reset();
      textareaRef.current?.blur();

      // Set default state
      setDropzoneDisabled(false);
      setCommentsDisabled(false);
      setIsMoreOpen(false);
      setIsFormEmpty(true);
      setAttLoading(false);
      setPostText(sendTo.invitation || '');
      setAttachments([]);
    }
  }, [createPostStatus.success, dispatch, sendTo.invitation]);

  // Reset on unmount
  useEffect(() => () => dispatch(resetPostCreateForm()), [dispatch]);

  return (
    <div className="create-post post-editor" role="form" aria-label="Write a post">
      <ErrorBoundary>
        <div>
          {sendTo.expanded && (
            <SendTo
              ref={selectFeeds}
              defaultFeed={sendTo.defaultFeed}
              isDirects={isDirects}
              user={user}
              onChange={checkCreatePostAvailability}
            />
          )}

          <Dropzone
            onInit={setDropzoneObject}
            addAttachmentResponse={handleAddAttachmentResponse}
            onSending={attLoadingStarted}
            onQueueComplete={attLoadingCompleted}
          />

          <SmartTextarea
            ref={textareaRef}
            className="post-textarea"
            value={postText}
            onText={onPostTextChange}
            onFocus={expandSendTo}
            onSubmit={doCreatePost}
            onFile={handleFile}
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
              disabled={dropzoneDisabled}
              role="button"
            >
              <Icon icon={faPaperclip} className="upload-icon" /> Add photos or files
            </span>

            <ButtonLink className="post-edit-more-trigger" onClick={toggleMore}>
              <MoreWithTriangle />
            </ButtonLink>

            {isMoreOpen ? (
              <div className="post-edit-more">
                <label>
                  <input
                    className="post-edit-more-checkbox"
                    type="checkbox"
                    value={commentsDisabled}
                    onChange={handleChangeOfMoreCheckbox}
                  />
                  <span className="post-edit-more-labeltext">Comments disabled</span>
                </label>
              </div>
            ) : (
              false
            )}
          </div>

          <SubmitModeHint input={textareaRef} className="post-edit-hint" />

          <div className="post-edit-buttons">
            {createPostStatus.loading && (
              <span className="throbber">
                <Throbber />
              </span>
            )}
            <button
              className="btn btn-default btn-xs"
              onClick={doCreatePost}
              disabled={!canSubmitForm}
            >
              Post
            </button>
          </div>
        </div>

        {dropzoneDisabled && (
          <div className="alert alert-warning">
            The maximum number of attached files ({attachmentsMaxCount}) has been reached
          </div>
        )}

        {createPostStatus.error ? (
          <div className="alert alert-danger">{createPostStatus.errorText}</div>
        ) : (
          false
        )}

        <PostAttachments
          attachments={attachments}
          isEditing={true}
          removeAttachment={removeAttachment}
          reorderImageAttachments={reorderImageAttachments}
          showMedia={showMedia}
        />

        <div className="dropzone-previews" />
      </ErrorBoundary>
    </div>
  );
}
