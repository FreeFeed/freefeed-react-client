// @ts-check
/* global CONFIG */
import storage from 'local-storage-fallback';
import { isEqual } from 'lodash-es';
import { setAttachment } from '../redux/action-creators';
import { setDelayedAction } from './drafts-throttling';

/**
 * @typedef {{ id: string }} File
 * @typedef {{ text?: string, feeds?: string[], files?: File[], fileIds?: string[] }} DraftData
 * @typedef {(key?: string) => void} UpdateHandler
 */

// @ts-ignore
const KEY_PREFIX = CONFIG.drafts.storagePrefix;

export function newPostDraftKey() {
  return 'post:new';
}
export function newCommentDraftKey(/** @type {string} */ postId) {
  return `comment:new:${postId}`;
}
export function editPostDraftKey(/** @type {string} */ postId) {
  return `post:${postId}`;
}
export function editCommentDraftKey(/** @type {string} */ commentId) {
  return `comment:${commentId}`;
}

/**
 * @param {string} key
 * @returns {DraftData|undefined}
 */
export function getDraft(key) {
  return allDrafts.get(key);
}

/**
 * @param {string} key
 * @returns {boolean}
 */
export function hasDraft(key) {
  return allDrafts.has(key);
}

/**
 * @template {Exclude<keyof DraftData, 'fileIds'>} F
 * @param {string} key
 * @param {F} field
 * @param {Exclude<DraftData[F], undefined>} value
 */
export function setDraftField(key, field, value) {
  const newData = { ...getDraft(key), [field]: value };
  if (field === 'files') {
    fillFileIds(newData);
  }
  setDraftData(key, newData);
}

/**
 * @param {string} key
 */
export function deleteDraft(key) {
  setDraftData(key, null);
}

/**
 * Remove draft if it has no meaningful data
 *
 * @param {string} key
 */
export function deleteEmptyDraft(key) {
  const data = getDraft(key);
  if (data && !data.text?.trim() && !data.files?.length) {
    deleteDraft(key);
  }
}

export function deleteAllDrafts() {
  for (const storeKey of Object.keys(storage)) {
    if (!isDraftKey(storeKey)) {
      continue;
    }
    storage.removeItem(storeKey);
  }
  allDrafts.clear();
}

let draftLoadedResolve;
const draftLoaded = new Promise((resolve) => (draftLoadedResolve = resolve));
export function initDrafts() {
  for (const [storeKey, value] of Object.entries(storage)) {
    if (!isDraftKey(storeKey)) {
      continue;
    }
    try {
      /** @type {DraftData} */
      const draft = JSON.parse(value);
      fillFileIds(draft);
      allDrafts.set(trimDraftPrefix(storeKey), draft);
    } catch {
      // It happens...
    }
  }

  draftLoadedResolve();

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
      const draft = JSON.parse(event.newValue ?? 'null');
      fillFileIds(draft);
      setDraftData(key, draft, { external: true });
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
  // eslint-disable-next-line promise/catch-or-return
  draftLoaded.then(() => {
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

    // Put found files to the redux store
    for (const file of allFiles.values()) {
      store.dispatch(setAttachment(file));
    }

    return;
  });

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

/**
 * @param {DraftData|null} data
 */
function fillFileIds(data) {
  if (!data) {
    return;
  }
  if (data.files) {
    data.fileIds = data.files.map((f) => f.id);
  } else {
    delete data.fileIds;
  }
}
