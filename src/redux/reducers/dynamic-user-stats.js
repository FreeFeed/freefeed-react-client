import { GET_USER_STATS } from '../action-types';
import { fromResponse, asyncState, initialAsyncState } from '../async-helpers';

import { setOnLocationChange } from './helpers';

export const userStatsStatus = asyncState(GET_USER_STATS, setOnLocationChange(initialAsyncState));
export const userStats = fromResponse(GET_USER_STATS, (action) => action.payload.statistics);
