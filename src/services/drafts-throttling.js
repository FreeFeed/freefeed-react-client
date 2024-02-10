// @ts-check
const saveInterval = 500;

/** @type {Map<string, () => void>} */
const delayedActions = new Map();
/** @type {Map<string, NodeJS.Timeout>} */
const delayedTimers = new Map();

/**
 * @param {string} key
 * @param {() => void} action
 */
export function setDelayedAction(key, action) {
  delayedActions.set(key, action);
  if (delayedTimers.has(key)) {
    return;
  }
  delayedTimers.set(
    key,
    setTimeout(() => {
      const action = delayedActions.get(key);
      if (action) {
        action();
        delayedActions.delete(key);
      }
      delayedTimers.delete(key);
    }, saveInterval),
  );
}
