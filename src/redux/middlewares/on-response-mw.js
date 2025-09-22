import { asyncPhase, RESPONSE_PHASE } from '../async-helpers';

/**
 * Allows to perform some action after the async request succeeds
 */
export const onResponseMiddleware = () => (next) => (action) => {
  const res = next(action);
  if (asyncPhase(action.type) === RESPONSE_PHASE && action.extra?.onResponse) {
    action.extra.onResponse(action);
  }
  return res;
};
