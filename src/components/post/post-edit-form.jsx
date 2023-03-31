import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Icon } from '../fontawesome-icons';
import SendTo from '../send-to';
import { SmartTextarea } from '../smart-textarea';
import { SubmitModeHint } from '../submit-mode-hint';
import { Throbber } from '../throbber';
import { initialAsyncState } from '../../redux/async-helpers';
import { cancelEditingPost, saveEditingPost } from '../../redux/action-creators';
import { useFileChooser } from '../uploader/file-chooser';
import { useUploader } from '../uploader/uploader';
import { UploadProgress } from '../uploader/progress';
import { destinationsPrivacy } from '../select-utils';
import { useServerValue } from '../hooks/server-info';
import PostAttachments from './post-attachments';

const selectMaxFilesCount = (serverInfo) => serverInfo.attachments.maxCountPerPost;
const selectMaxPostLength = (serverInfo) => serverInfo.maxTextLength.post;

export function PostEditForm({ id, isDirect, recipients, createdBy, body, attachments }) {
  const dispatch = useDispatch();
  const saveState = useSelector((state) => state.saveEditingPostStatuses[id] ?? initialAsyncState);

  const maxFilesCount = useServerValue(selectMaxFilesCount, Infinity);
  const maxPostLength = useServerValue(selectMaxPostLength, 1e3);

  const [feedsSelector, setFeedsSelector] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [postText, setPostText] = useState(body);
  const [privacyWarning, setPrivacyWarning] = useState(null);

  const textareaRef = useRef();

  // Uploading files
  const { isUploading, fileIds, uploadFile, uploadProgressProps, postAttachmentsProps } =
    useUploader({ maxCount: maxFilesCount, fileIds: attachments });

  const doChooseFiles = useFileChooser(uploadFile, { multiple: true });

  const canUploadMore = useMemo(
    () => fileIds.length < maxFilesCount,
    [fileIds.length, maxFilesCount],
  );

  const chooseFiles = useCallback(
    () => canUploadMore && doChooseFiles(),
    [canUploadMore, doChooseFiles],
  );

  const registerFeedSelector = useCallback((ref) => {
    setFeedsSelector(ref);
    if (ref) {
      setFeeds(ref.values.slice());
    } else {
      setFeeds([]);
    }
  }, []);

  // It's a hack and should be replaced with a proper code with privacy checking
  const store = useStore();
  useEffect(() => {
    if (isDirect) {
      return;
    }
    const postPrivacy = getPostPrivacy(recipients, createdBy);
    const destPrivacy = destinationsPrivacy(feeds, store.getState());

    if (
      (postPrivacy.isPrivate && !destPrivacy.isPrivate) ||
      (postPrivacy.isProtected && !destPrivacy.isProtected)
    ) {
      const pp = postPrivacy.isPrivate
        ? 'private'
        : postPrivacy.isProtected
        ? 'protected'
        : 'public';
      const dp = destPrivacy.isPrivate
        ? 'private'
        : destPrivacy.isProtected
        ? 'protected'
        : 'public';
      setPrivacyWarning(`This action will make this ${pp} post ${dp}.`);
    } else {
      setPrivacyWarning(null);
    }
  }, [createdBy, feeds, isDirect, recipients, store]);

  const canSubmitForm = useMemo(() => {
    return (
      (postText.trim() !== '' || fileIds.length > 0) &&
      feeds.length > 0 &&
      !feedsSelector?.isIncorrectDestinations &&
      !saveState.loading &&
      !isUploading
    );
  }, [
    postText,
    fileIds.length,
    feeds.length,
    feedsSelector?.isIncorrectDestinations,
    saveState.loading,
    isUploading,
  ]);

  const handleSubmit = useCallback(() => {
    if (!canSubmitForm) {
      return;
    }

    dispatch(
      saveEditingPost(id, {
        body: postText,
        attachments: fileIds,
        feeds,
      }),
    );
  }, [canSubmitForm, dispatch, feeds, fileIds, id, postText]);

  const handleCancel = useCallback(() => dispatch(cancelEditingPost(id)), [dispatch, id]);

  return (
    <>
      <div>
        <SendTo
          ref={registerFeedSelector}
          defaultFeed={recipients.map((r) => r.username)}
          isDirects={isDirect}
          isEditing={true}
          disableAutoFocus={true}
          user={createdBy}
          onChange={setFeeds}
        />
        <div className="post-privacy-warning">{privacyWarning}</div>
      </div>
      <div className="post-editor">
        <div>
          <SmartTextarea
            className="post-textarea"
            ref={textareaRef}
            value={postText}
            onSubmit={handleSubmit}
            onText={setPostText}
            onFile={chooseFiles}
            autoFocus={true}
            minRows={2}
            maxRows={10}
            maxLength={maxPostLength}
            dir="auto"
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
          </div>

          <SubmitModeHint input={textareaRef} className="post-edit-hint" />

          <div className="post-edit-buttons">
            {saveState.loading && (
              <span className="post-edit-throbber">
                <Throbber />
              </span>
            )}
            <a className="post-cancel" onClick={handleCancel}>
              Cancel
            </a>
            <button
              className="btn btn-default btn-xs"
              onClick={handleSubmit}
              disabled={!canSubmitForm}
            >
              Update
            </button>
          </div>
        </div>

        {!canUploadMore && (
          <div className="alert alert-warning">
            The maximum number of attached files ({maxFilesCount}) has been reached
          </div>
        )}
        {saveState.error && (
          <div className="post-error alert alert-danger">{saveState.errorText}</div>
        )}

        <UploadProgress {...uploadProgressProps} />
        <PostAttachments {...postAttachmentsProps} />
      </div>
    </>
  );
}

function getPostPrivacy(recipients, createdBy) {
  const authorOrGroupsRecipients = recipients.filter(
    (r) => r.id === createdBy.id || r.type === 'group',
  );
  const isPrivate = !authorOrGroupsRecipients.some((r) => r.isPrivate === '0');
  const isProtected = isPrivate || !authorOrGroupsRecipients.some((r) => r.isProtected === '0');
  return { isPrivate, isProtected };
}
