import { GET_ATTACHMENTS_STATS, SANITIZE_MEDIA } from '../action-types';
import { asyncState, fromResponse, initialAsyncState, response } from '../async-helpers';
import { reducersChain, setOnLocationChange } from './helpers';

export const attachmentsStatsStatus = asyncState(
  GET_ATTACHMENTS_STATS,
  setOnLocationChange(initialAsyncState),
);

export const sanitizeMediaStatus = asyncState(
  SANITIZE_MEDIA,
  setOnLocationChange(initialAsyncState),
);

export const attachmentsStats = fromResponse(
  GET_ATTACHMENTS_STATS,
  (action) => action.payload,
  {},
  reducersChain((state, action) => {
    if (action.type === response(SANITIZE_MEDIA)) {
      return { ...state, sanitizeTask: action.payload.sanitizeTask };
    }
    return state;
  }, setOnLocationChange({})),
);
