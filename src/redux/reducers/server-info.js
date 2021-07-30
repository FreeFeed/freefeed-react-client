import satisfies from 'semver/functions/satisfies';

import { GET_SERVER_INFO } from '../action-types';
import { asyncState, fromResponse } from '../async-helpers';

export const serverInfo = fromResponse(
  GET_SERVER_INFO,
  ({ payload }) => {
    return {
      ...payload,
      features: {
        perGroupsPostDelete: satisfies(payload.version, '^1.100.0'),
      },
    };
  },
  { features: {} },
);

export const serverInfoStatus = asyncState(GET_SERVER_INFO);
