import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, resetPostCreateForm } from '../redux/action-creators';
import { ButtonLink } from './button-link';
import ErrorBoundary from './error-boundary';
import { Icon } from './fontawesome-icons';
import { MoreWithTriangle } from './more-with-triangle';
import SendTo from './send-to';
import { SmartTextarea } from './smart-textarea';
import { SubmitModeHint } from './submit-mode-hint';
import { Throbber } from './throbber';
import { useFileChooser } from './uploader/file-chooser';
import { useUploader } from './uploader/uploader';
import { UploadProgress } from './uploader/progress';
import { PreventPageLeaving } from './prevent-page-leaving';
import PostAttachments from './post/post-attachments';
import { useBool } from './hooks/bool';
import { useServerValue } from './hooks/server-info';

const selectMaxFilesCount = (serverInfo) => serverInfo.attachments.maxCountPerPost;
const selectMaxPostLength = (serverInfo) => serverInfo.maxTextLength.post;

export default function CreatePost({ sendTo, expandSendTo, user, isDirects }) {
  const dispatch = useDispatch();
  const createPostStatus = useSelector((state) => state.createPostStatus);

  const maxFilesCount = useServerValue(selectMaxFilesCount, Infinity);
  const maxPostLength = useServerValue(selectMaxPostLength, 1e3);

  const textareaRef = useRef();

  // Local state
  const [commentsDisabled, toggleCommentsDisabled] = useBool(false);
  const [isMoreOpen, toggleIsMoreOpen] = useBool(false);
  const [postText, setPostText] = useState(sendTo.invitation || '');
  const [feedsSelector, setFeedsSelector] = useState(null);
  const [feeds, setFeeds] = useState([]);

  const resetLocalState = useCallback(() => {
    toggleCommentsDisabled(false);
    toggleIsMoreOpen(false);
    setPostText(sendTo.invitation || '');
  }, [sendTo.invitation, toggleCommentsDisabled, toggleIsMoreOpen]);

  // Uploading files
  const {
    isUploading,
    fileIds,
    uploadFile,
    clearUploads,
    uploadProgressProps,
    postAttachmentsProps,
  } = useUploader({ maxCount: maxFilesCount });

  // Expand SendTo if we have some files
  useEffect(() => void (fileIds.length > 0 && expandSendTo()), [expandSendTo, fileIds.length]);

  const doChooseFiles = useFileChooser(uploadFile, { multiple: true });

  const canUploadMore = useMemo(
    () => fileIds.length < maxFilesCount,
    [fileIds.length, maxFilesCount],
  );

  const chooseFiles = useCallback(
    () => canUploadMore && doChooseFiles(),
    [canUploadMore, doChooseFiles],
  );

  const isFormDirty = useMemo(
    () => (postText.trim() !== '' || fileIds.length > 0) && !isUploading,
    [fileIds.length, isUploading, postText],
  );

  const canSubmitForm = useMemo(() => {
    return (
      isFormDirty &&
      !createPostStatus.loading &&
      feeds.length > 0 &&
      !feedsSelector?.isIncorrectDestinations
    );
  }, [createPostStatus.loading, feeds.length, feedsSelector?.isIncorrectDestinations, isFormDirty]);

  const doCreatePost = useCallback(
    (e) => {
      e?.preventDefault?.();
      canSubmitForm && dispatch(createPost(feeds, postText, fileIds, { commentsDisabled }));
    },
    [fileIds, canSubmitForm, commentsDisabled, dispatch, feeds, postText],
  );

  const handleCommentsDisable = useCallback(
    (e) => toggleCommentsDisabled(e.target.checked),
    [toggleCommentsDisabled],
  );

  useEffect(() => {
    // Reset form on success
    if (createPostStatus.success) {
      feedsSelector?.reset();
      textareaRef.current?.blur();
      clearUploads();
      resetLocalState();
      dispatch(resetPostCreateForm());
    }
  }, [clearUploads, createPostStatus.success, dispatch, feedsSelector, resetLocalState]);

  // Reset async status on unmount
  useEffect(() => () => dispatch(resetPostCreateForm()), [dispatch]);

  const registerFeedSelector = useCallback((ref) => {
    setFeedsSelector(ref);
    if (ref) {
      setFeeds(ref.values.slice());
    } else {
      setFeeds([]);
    }
  }, []);

  const containerRef = useRef();
  useEffect(() => {
    const h = () => import('react-select');
    const el = containerRef.current;
    el.addEventListener('click', h, { once: true });
    return () => el.removeEventListener('click', h, { once: true });
  }, []);

  return (
    <div
      className="create-post post-editor"
      role="form"
      aria-label="Write a post"
      ref={containerRef}
    >
      <ErrorBoundary>
        <PreventPageLeaving prevent={isFormDirty} />
        <div>
          {sendTo.expanded && (
            <SendTo
              ref={registerFeedSelector}
              defaultFeed={sendTo.defaultFeed}
              isDirects={isDirects}
              user={user}
              onChange={setFeeds}
            />
          )}

          <SmartTextarea
            ref={textareaRef}
            className="post-textarea"
            dragOverClassName="post-textarea__dragged"
            value={postText}
            onText={setPostText}
            onFocus={expandSendTo}
            onSubmit={doCreatePost}
            onFile={uploadFile}
            minRows={3}
            maxRows={10}
            maxLength={maxPostLength}
            dir={'auto'}
          />
        </div>

        <div className="post-edit-actions">
          <div className="post-edit-options">
            <span
              className="post-edit-attachments"
              disabled={!canUploadMore}
              role="button"
              onClick={chooseFiles}
            >
              <Icon icon={faPaperclip} className="upload-icon" /> Add photos or files
            </span>

            <ButtonLink className="post-edit-more-trigger" onClick={toggleIsMoreOpen}>
              <MoreWithTriangle />
            </ButtonLink>

            {isMoreOpen ? (
              <div className="post-edit-more">
                <label>
                  <input
                    className="post-edit-more-checkbox"
                    type="checkbox"
                    value={commentsDisabled}
                    onChange={handleCommentsDisable}
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

        {!canUploadMore && (
          <div className="alert alert-warning">
            The maximum number of attached files ({maxFilesCount}) has been reached
          </div>
        )}

        {createPostStatus.error ? (
          <div className="alert alert-danger">{createPostStatus.errorText}</div>
        ) : (
          false
        )}

        <UploadProgress {...uploadProgressProps} />
        <PostAttachments {...postAttachmentsProps} />
      </ErrorBoundary>
    </div>
  );
}
