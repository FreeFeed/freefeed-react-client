import {
  faGlobeAmericas,
  faLock,
  faPaperclip,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Icon } from '../fontawesome-icons';
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
import { Selector } from '../feeds-selector/selector';
import { EDIT_DIRECT, EDIT_REGULAR } from '../feeds-selector/constants';
import { ButtonLink } from '../button-link';
import { usePrivacyCheck } from '../feeds-selector/privacy-check';
import PostAttachments from './post-attachments';

const selectMaxFilesCount = (serverInfo) => serverInfo.attachments.maxCountPerPost;
const selectMaxPostLength = (serverInfo) => serverInfo.maxTextLength.post;

export function PostEditForm({ id, isDirect, recipients, createdBy, body, attachments }) {
  const dispatch = useDispatch();
  const saveState = useSelector((state) => state.saveEditingPostStatuses[id] ?? initialAsyncState);

  const maxFilesCount = useServerValue(selectMaxFilesCount, Infinity);
  const maxPostLength = useServerValue(selectMaxPostLength, 1e3);

  const recipientNames = useMemo(() => recipients.map((r) => r.username), [recipients]);
  const [feeds, setFeeds] = useState(recipientNames);
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

  const [hasFeedsError, setHasFeedsError] = useState(false);

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
      !hasFeedsError &&
      !saveState.loading &&
      !isUploading
    );
  }, [postText, fileIds.length, hasFeedsError, saveState.loading, isUploading]);

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

  const [privacyLevel] = usePrivacyCheck(feeds);

  const privacyIcon = useMemo(
    () =>
      privacyLevel === 'private' ? (
        <Icon icon={faLock} />
      ) : privacyLevel === 'protected' ? (
        <Icon icon={faUserFriends} />
      ) : privacyLevel === 'public' ? (
        <Icon icon={faGlobeAmericas} />
      ) : privacyLevel === 'direct' ? (
        <Icon icon={faLock} />
      ) : null,
    [privacyLevel],
  );

  const privacyTitle = useMemo(
    () =>
      privacyLevel === 'private'
        ? 'Update private post'
        : privacyLevel === 'protected'
        ? 'Update protected post'
        : privacyLevel === 'public'
        ? 'Update public post'
        : privacyLevel === 'direct'
        ? 'Update direct message'
        : null,
    [privacyLevel],
  );

  return (
    <>
      <div>
        <Selector
          mode={isDirect ? EDIT_DIRECT : EDIT_REGULAR}
          feedNames={feeds}
          fixedFeedNames={isDirect ? recipientNames : []}
          onChange={setFeeds}
          onError={setHasFeedsError}
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
            onFile={uploadFile}
            autoFocus={true}
            minRows={2}
            maxRows={10}
            maxLength={maxPostLength}
            dir="auto"
          />
        </div>

        <div className="post-edit-actions">
          <div className="post-edit-buttons">
            <button
              className="btn btn-default btn-xs"
              onClick={handleSubmit}
              aria-disabled={!canSubmitForm}
              title={privacyTitle}
              aria-label={privacyTitle}
            >
              <span className="post-submit-icon">{privacyIcon}</span>
              Update
            </button>
            <ButtonLink className="post-cancel" onClick={handleCancel}>
              Cancel
            </ButtonLink>
            {saveState.loading && (
              <span className="post-edit-throbber">
                <Throbber />
              </span>
            )}
          </div>
          <div className="post-edit-options">
            <ButtonLink
              className="post-edit-attachments"
              disabled={!canUploadMore}
              onClick={chooseFiles}
            >
              <Icon icon={faPaperclip} className="upload-icon" /> Add photos or files
            </ButtonLink>
          </div>

          <SubmitModeHint input={textareaRef} className="post-edit-hint" />
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
