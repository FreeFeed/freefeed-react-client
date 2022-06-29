import { GET_SERVER_INFO } from '../action-types';
import { asyncState, fromResponse } from '../async-helpers';

export const serverInfo = fromResponse(GET_SERVER_INFO, (action) => action.payload, {});

export const serverInfoStatus = asyncState(GET_SERVER_INFO);
