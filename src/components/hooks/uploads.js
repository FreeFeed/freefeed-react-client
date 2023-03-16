import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createAttachment } from '../../redux/action-creators';
import { UploadProgress } from '../upload-progress';

let nextUploadId = 1;

export function useUploader({ onSuccess }) {
  const dispatch = useDispatch();
  const [uploadIds, setUploadIds] = useState([]);
  const doneUploads = useRef([]);
  const statuses = useSelector((state) => state.attachmentUploadStatuses);
  const uploads = useSelector((state) => state.attachmentUploads);

  // Upload new file
  const uploadFile = useCallback(
    (file) => {
      const newId = `upl${nextUploadId++}`;
      setUploadIds((ids) => [...ids, newId]);
      dispatch(createAttachment(newId, file));
    },
    [dispatch],
  );

  // Detect successful uploads
  useEffect(() => {
    const newIds = uploadIds.filter(
      (id) => statuses[id]?.success && !doneUploads.current.includes(id),
    );
    for (const id of newIds) {
      onSuccess(uploads[id].attachment);
      doneUploads.current.push(id);
    }
  }, [uploadIds, statuses, uploads, onSuccess]);

  // Some uploads are in progress
  const loading = useMemo(
    () => uploadIds.some((id) => statuses[id]?.loading),
    [uploadIds, statuses],
  );

  // Uploads that should be shown in the progress UI
  const unfinishedIds = useMemo(
    () => uploadIds.filter((id) => statuses[id]?.loading || statuses[id]?.error),
    [uploadIds, statuses],
  );

  // Uploader UI
  const uploadProgressUI = <UploadProgress uploadIds={unfinishedIds} />;

  return { uploadFile, loading, uploadProgressUI };
}

export function useFileChooser({ onChoose, accept, multiple }) {
  const fileInput = useMemo(() => {
    const input = document.createElement('input');
    input.type = 'file';
    if (accept) {
      input.accept = accept;
    }
    if (multiple) {
      input.multiple = true;
    }
    input.addEventListener('change', () => {
      for (let i = 0; i < input.files.length; i++) {
        onChoose(input.files[i]);
      }
      input.value = ''; // reset input state
    });
    return input;
  }, [onChoose, accept, multiple]);

  const choose = useCallback(() => fileInput.click(), [fileInput]);
  return choose;
}
