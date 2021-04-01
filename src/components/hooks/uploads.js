import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAttachment } from '../../redux/action-creators';
import { makeJpegIfNeeded } from '../../utils/jpeg-if-needed';
import { webpToJpeg } from '../../utils/webp-to-jpeg';
import { UploadProgress } from '../upload-progress';
import { useEventListener } from './sub-unsub';

let nextUploadId = 1;

export function useUploader({ dropTargetRef, pasteTargetRef, onSuccess }) {
  const dispatch = useDispatch();
  const [uploadIds, setUploadIds] = useState([]);
  const doneUploads = useRef([]);
  const statuses = useSelector((state) => state.attachmentUploadStatuses);
  const uploads = useSelector((state) => state.attachmentUploads);

  // Upload new file
  const uploadFile = useCallback(
    (file) =>
      webpToJpeg(file).then((file) => {
        const newId = `upl${nextUploadId++}`;
        setUploadIds((ids) => [...ids, newId]);
        dispatch(createAttachment(newId, file));
      }),
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
  const loading = useMemo(() => uploadIds.some((id) => statuses[id]?.loading), [
    uploadIds,
    statuses,
  ]);

  // Uploads that should be shown in the progress UI
  const unfinishedIds = useMemo(
    () => uploadIds.filter((id) => statuses[id]?.loading || statuses[id]?.error),
    [uploadIds, statuses],
  );

  // Events

  const [draggingOver, setDraggingOver] = useState(false);
  const onDragEnter = useCallback((e) => containsFiles(e) && setDraggingOver(true), []);
  const onDragLeave = useCallback(() => setDraggingOver(false), []);
  const onDragOver = useCallback((e) => containsFiles(e) && e.preventDefault(), []);
  const onDrop = useCallback(
    (e) => {
      setDraggingOver(false);
      if (containsFiles(e)) {
        e.preventDefault();
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          uploadFile(e.dataTransfer.files[i]);
        }
      }
    },
    [uploadFile],
  );
  const onPaste = useCallback(
    (e) => {
      if (!e.clipboardData?.items) {
        return;
      }

      const { items } = e.clipboardData;
      let withImages = false;
      for (const item of items) {
        if (item.type.indexOf('image/') !== 0) {
          continue;
        }
        withImages = true;

        const blob = item.getAsFile();
        if (!blob.name) {
          blob.name = 'image.png';
        }
        makeJpegIfNeeded(blob).then(uploadFile);
      }
      withImages && e.preventDefault();
    },
    [uploadFile],
  );

  useEventListener(dropTargetRef, 'dragenter', onDragEnter);
  useEventListener(dropTargetRef, 'dragleave', onDragLeave);
  useEventListener(dropTargetRef, 'dragover', onDragOver);
  useEventListener(dropTargetRef, 'drop', onDrop);
  useEventListener(pasteTargetRef, 'paste', onPaste);

  // Uploader UI
  const uploadProgressUI = <UploadProgress uploadIds={unfinishedIds} />;

  return { uploadFile, loading, draggingOver, uploadProgressUI };
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

function containsFiles(dndEvent) {
  if (dndEvent.dataTransfer && dndEvent.dataTransfer.types) {
    // Event.dataTransfer.types is DOMStringList (not Array) in Firefox,
    // so we can't just use indexOf().
    for (let i = 0; i < dndEvent.dataTransfer.types.length; i++) {
      if (dndEvent.dataTransfer.types[i] === 'Files') {
        return true;
      }
    }
  }
  return false;
}
