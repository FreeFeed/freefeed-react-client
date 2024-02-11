// @ts-check
/* global CONFIG */
import storage from 'local-storage-fallback';
import { isEqual } from 'lodash-es';
import { setAttachment } from '../redux/action-creators';
import { setDelayedAction } from './drafts-throttling';

/**
 * @typedef {{ id: string }} File
 * @typedef {{ text?: string, feeds?: string[], files?: File[] }} DraftData
 * @typedef {(key?: string) => void} UpdateHandler
 */

// @ts-ignore
const KEY_PREFIX = CONFIG.drafts.storagePrefix;

export const NEW_POST_KEY = 'post:new';

/**
 * @param {string} key
 * @returns {DraftData|undefined}
 */
export function getDraft(key) {
  return allDrafts.get(key);
}

/**
 * @template {keyof DraftData} F
 * @param {string} key
 * @param {F} field
 * @param {Exclude<DraftData[F], undefined>} value
 */
export function setDraftField(key, field, value) {
  setDraftData(key, { ...getDraft(key), [field]: value });
}

/**
 * @param {string} key
 */
export function deleteDraft(key) {
  setDraftData(key, null);
}

export function initDrafts() {
  for (const [storeKey, value] of Object.entries(storage)) {
    if (!isDraftKey(storeKey)) {
      continue;
    }
    try {
      /** @type {DraftData} */
      const draft = JSON.parse(value);
      allDrafts.set(trimDraftPrefix(storeKey), draft);
    } catch {
      // It happens...
    }
  }

  globalThis.addEventListener?.('storage', (event) => {
    if (event.key === null) {
      // Storage was clear()'ed
      allDrafts.clear();
      triggerUpdate();
      return;
    }
    if (!isDraftKey(event.key)) {
      return;
    }
    const key = trimDraftPrefix(event.key);
    try {
      setDraftData(key, JSON.parse(event.newValue ?? 'null'), { external: true });
      triggerUpdate(key);
    } catch {
      // It happens...
    }
  });
}

/**
 * @param {import("redux").Store} store
 */
export function loadDraftsToStore(store) {
  /** @type {Map<string, File>} */
  const allFiles = new Map();

  for (const draft of allDrafts.values()) {
    if (!draft.files) {
      continue;
    }
    for (const f of draft.files) {
      allFiles.set(f.id, f);
    }
  }

  setTimeout(() => {
    // Put found files to the redux store
    for (const file of allFiles.values()) {
      store.dispatch(setAttachment(file));
    }
  }, 0);

  // Update attachments in store on external draft update
  subscribeToDrafts((key) => {
    if (!key) {
      return;
    }
    const files = getDraft(key)?.files;
    if (!files) {
      return;
    }
    for (const file of files) {
      store.dispatch(setAttachment(file));
    }
  });
}

/**
 * @param {string} key
 * @param {DraftData | null} data
 * @param {{external?: boolean}} options
 */
function setDraftData(key, data, { external = false } = {}) {
  if (isUnchangedData(data, getDraft(key) ?? null)) {
    return;
  }
  if (isEmptyData(data)) {
    allDrafts.delete(key);
    !external && setDelayedAction(key, () => storage.removeItem(KEY_PREFIX + key));
  } else {
    // @ts-expect-error 'data' is not null here
    allDrafts.set(key, data);
    !external &&
      setDelayedAction(key, () => storage.setItem(KEY_PREFIX + key, JSON.stringify(data)));
  }
}

/**
 * Subscribe to drafts update
 *
 * @param {UpdateHandler} listener
 * @returns {() => void} - unsubscribe function
 */
export function subscribeToDrafts(listener) {
  updateHandlers.add(listener);
  return () => updateHandlers.delete(listener);
}

/**
 * In-memory copy of relevant localStorage keys
 *
 * @type {Map<string, DraftData>}
 */
const allDrafts = new Map();

/**
 * Listeners to drafts updates
 *
 * @type {Set<UpdateHandler>}
 */
const updateHandlers = new Set();

/**
 * @param {string} [key]
 */
function triggerUpdate(key) {
  for (const handler of updateHandlers) {
    handler(key);
  }
}

/**
 * @param {unknown} storageKey
 * @returns {boolean}
 */
function isDraftKey(storageKey) {
  return typeof storageKey === 'string' && storageKey.startsWith(KEY_PREFIX);
}

/**
 * @param {string} storageKey
 * @returns {string}
 */
function trimDraftPrefix(storageKey) {
  return storageKey.startsWith(KEY_PREFIX) ? storageKey.slice(KEY_PREFIX.length) : storageKey;
}

/**
 *
 * @param {DraftData | null} data1
 * @param {DraftData | null} data2
 * @returns {boolean}
 */
function isUnchangedData(data1, data2) {
  return data2 === data1 || isEqual(data1, data2);
}

/**
 * Check if no data in the given draft
 *
 * @param {DraftData | null} data
 * @returns {boolean}
 */
function isEmptyData(data) {
  return !data || (!data.text?.trim() && !data.files?.length && !data.feeds?.length);
}
