import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAttachment, setUploadError } from '../../redux/action-creators';
import { useServerValue } from '../hooks/server-info';

// SPA-unique upload identifier
let nextId = 1;

export function useUploader({
  // Upload success (takes attachment object and upload ID)
  onSuccess = null,
  // Upload error (takes error string and upload ID)
  onError = null,
  // The maximum number of unfinished (in progress or erroneous) uploads. When
  // this number is reached, no new uploads start. The total number of
  // uploaded files should be controlled from outside the component.
  maxUnfinishedUploads = Infinity,
} = {}) {
  const dispatch = useDispatch();
  const statuses = useSelector((state) => state.attachmentUploadStatuses);
  const allUploads = useSelector((state) => state.attachmentUploads);

  // Immutables
  const [unfinishedFiles, uploadIds] = useMemo(() => [new Map(), new Set()], []);

  const isUploading = useMemo(
    () => [...uploadIds].some((id) => statuses[id]?.loading),
    [statuses, uploadIds],
  );

  const maxFileSize = useServerValue(selectFileSizeLimit, Infinity);

  const doUploadFile = useCallback(
    (file) => {
      if (unfinishedFiles.size >= maxUnfinishedUploads) {
        // Too many files in progress, don't take any more
        return;
      }
      const uplId = `upl${nextId++}`;
      uploadIds.add(uplId);
      if (file.size > maxFileSize) {
        const sizMiB = (file.size / (1 << 20)).toFixed(2);
        const maxMiB = maxFileSize >> 20;
        dispatch(
          setUploadError(
            uplId,
            file.name,
            `File is too big: ${sizMiB} MiB, max accepted size: ${maxMiB} MiB`,
          ),
        );
        return;
      }
      unfinishedFiles.set(uplId, file);
      dispatch(createAttachment(uplId, file));
    },
    [dispatch, maxFileSize, maxUnfinishedUploads, unfinishedFiles, uploadIds],
  );

  // This function can be called synchronously multiple times
  const filesQueue = useRef([]);
  const uploadFile = useCallback(
    (file) => {
      filesQueue.current.push(file);
      // Asynchronously add files one by one
      const handleFile = () => {
        const file = filesQueue.current.shift();
        if (file) {
          doUploadFile(file);
          setTimeout(handleFile, 0);
        }
      };
      if (filesQueue.current.length === 1) {
        handleFile();
      }
    },
    [doUploadFile],
  );

  useEffect(() => {
    // Detect successful and erroneous uploads
    for (const id of uploadIds) {
      if (!statuses[id]?.success && !statuses[id]?.error) {
        continue;
      }
      if (statuses[id].success) {
        unfinishedFiles.delete(id);
        onSuccess?.(allUploads[id].attachment, id);
      }
      if (statuses[id].error) {
        onError?.(statuses[id].errorText, id);
      }
    }
  }, [allUploads, onError, onSuccess, statuses, unfinishedFiles, uploadIds]);

  const uploadProgressProps = useMemo(
    () => ({ uploadIds, statuses, unfinishedFiles }),
    [statuses, unfinishedFiles, uploadIds],
  );

  return { isUploading, uploadFile, uploadProgressProps };
}

const selectFileSizeLimit = (serverInfo) => serverInfo.attachments.fileSizeLimit;
