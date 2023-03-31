import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uniq } from 'lodash';
import { createAttachment, setUploadError } from '../../redux/action-creators';
import { useServerValue } from '../hooks/server-info';
import { useBool } from '../hooks/bool';

// SPA-unique upload identifier
let nextId = 1;

export function useUploader({
  // Upload success (takes attachment object and upload ID)
  onSuccess = null,
  fileIds: initialFileIds = [],
  maxCount = Infinity,
} = {}) {
  const dispatch = useDispatch();
  const statuses = useSelector((state) => state.attachmentUploadStatuses);
  const allUploads = useSelector((state) => state.attachmentUploads);

  // Immutables
  const [unfinishedFiles, uploadIds] = useMemo(() => [new Map(), new Set()], []);

  const [, forceUpdate] = useBool();

  // Attachments management
  const [fileIds, setFileIds] = useState(initialFileIds);
  const removeFile = useCallback(
    (idToRemove) => setFileIds((ids) => ids.filter((id) => id !== idToRemove)),
    [],
  );
  const reorderFiles = useCallback(
    (reorderedIds) => setFileIds((oldIds) => uniq(reorderedIds.concat(oldIds))),
    [],
  );

  const isUploading = useMemo(
    () => [...uploadIds].some((id) => statuses[id]?.loading),
    [statuses, uploadIds],
  );

  const maxFileSize = useServerValue(selectFileSizeLimit, Infinity);

  const doUploadFile = useCallback(
    (file) => {
      if (fileIds.length >= maxCount) {
        // No more files accepting
        return;
      }

      const uplId = `upl${nextId++}`;
      uploadIds.add(uplId);

      const sizeError = checkFileSize(file, maxFileSize);
      if (sizeError) {
        dispatch(setUploadError(uplId, file.name, sizeError));
        return;
      }

      unfinishedFiles.set(uplId, file);
      dispatch(createAttachment(uplId, file));
    },
    [dispatch, fileIds.length, maxCount, maxFileSize, unfinishedFiles, uploadIds],
  );

  // The 'uploadFile' function can be called synchronously multiple times
  const filesQueue = useRef([]);
  const uploadFile = useCallback(
    (file) => {
      filesQueue.current.push(file);
      if (filesQueue.current.length === 1) {
        forceUpdate();
      }
    },
    [forceUpdate],
  );

  // Process queue by one file on every render
  useEffect(() => {
    const file = filesQueue.current.shift();
    file && doUploadFile(file);
  });

  useEffect(() => {
    // Detect successful uploads
    for (const id of uploadIds) {
      if (statuses[id]?.success && unfinishedFiles.has(id)) {
        unfinishedFiles.delete(id);
        setFileIds((ids) => [...ids, allUploads[id].attachment.id]);
        onSuccess?.(allUploads[id].attachment, id);
      }
    }
  }, [allUploads, onSuccess, statuses, unfinishedFiles, uploadIds]);

  const uploadProgressProps = useMemo(
    () => ({ uploadIds, statuses, unfinishedFiles }),
    [statuses, unfinishedFiles, uploadIds],
  );

  const postAttachmentsProps = useMemo(
    () => ({
      attachmentIds: fileIds,
      removeAttachment: removeFile,
      reorderImageAttachments: reorderFiles,
      isEditing: true,
    }),
    [fileIds, removeFile, reorderFiles],
  );

  const clearUploads = useCallback(() => {
    uploadIds.clear();
    unfinishedFiles.clear();
    setFileIds(initialFileIds);
  }, [initialFileIds, unfinishedFiles, uploadIds]);

  return {
    isUploading,
    uploadFile,
    clearUploads,
    fileIds,
    uploadProgressProps,
    postAttachmentsProps,
  };
}

const selectFileSizeLimit = (serverInfo) => serverInfo.attachments.fileSizeLimit;

function checkFileSize(file, maxFileSize) {
  if (file.size <= maxFileSize) {
    return null;
  }
  const sizMiB = (file.size / (1 << 20)).toFixed(2);
  const maxMiB = maxFileSize >> 20;
  return `File is too big: ${sizMiB} MiB, max accepted size: ${maxMiB} MiB`;
}
