import createDebug from 'debug';

const prefix = 'freefeed:react';

export const realtimeSocketDebug = createDebug(`${prefix}:realtime:socket`);
export const realtimeSubscriptionDebug = createDebug(`${prefix}:realtime:subscriptions`);

export const unscrollDebug = createDebug(`${prefix}:unscroll`);

export const retryPromiseDebug = createDebug(`${prefix}:retryPromise`);

export const authDebug = createDebug(`${prefix}:auth`);
