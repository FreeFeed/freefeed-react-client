import { resetAttachmentUpload } from '../action-creators';
import { CREATE_ATTACHMENT } from '../action-types';
import { fail, reset } from '../async-helpers';

/**
 * Middleware for aborting attachment uploads
 */
export const abortableUploadMiddleware = () => {
  const abortControllers = new Map();

  return (next) => (action) => {
    if (action.type === CREATE_ATTACHMENT) {
      const { uploadId } = action.payload;
      const ctr = new AbortController();
      abortControllers.set(uploadId, ctr);
      const { signal } = ctr;
      return next({
        ...action,
        asyncOperation: async (params, options = {}) => {
          try {
            return await action.asyncOperation(params, { ...options, signal });
          } finally {
            abortControllers.delete(uploadId);
          }
        },
      });
    }
    if (action.type === reset(CREATE_ATTACHMENT)) {
      const { uploadId } = action.payload;
      abortControllers.get(uploadId)?.abort();
      return next(action);
    }
    if (action.type === fail(CREATE_ATTACHMENT) && action.payload.err === 'Request aborted') {
      // User aborted the upload, threat it as reset
      return next(resetAttachmentUpload(action.request.uploadId));
    }

    return next(action);
  };
};
