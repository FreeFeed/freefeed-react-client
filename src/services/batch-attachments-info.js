import { getAttachmentsInfo } from './api';

const maxBatchSize = 50; // items
const batchTimeout = 50; // milliseconds
const cache = new Map(); // Resolved results cache
const pendingPromises = new Map(); // Pending promises cache

let timer = 0;
let resolvers = new Map();

/**
 * Returns a promise that resolves to the attachment info. It uses batch
 * requests and cache under the hood, so the real requests are made only when
 * needed.
 *
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getAttachmentInfo(id) {
  // Return cached result
  if (cache.has(id)) {
    return cache.get(id);
  }

  // Return existing pending promise
  if (pendingPromises.has(id)) {
    return pendingPromises.get(id);
  }

  // Create new promise
  const promise = new Promise((resolve, reject) => {
    if (resolvers.size === 0) {
      timer = setTimeout(executeBatch, batchTimeout);
    }

    resolvers.set(id, { resolve, reject });

    if (resolvers.size >= maxBatchSize) {
      clearTimeout(timer);
      executeBatch();
    }
  });

  pendingPromises.set(id, promise);
  return promise;
}

async function executeBatch() {
  const ids = Array.from(resolvers.keys());
  const currentResolves = resolvers;

  resolvers = new Map();
  timer = 0;
  try {
    const { attachments, idsNotFound } = await getAttachmentsInfo(ids).then((r) => r.json());
    const resultsMap = new Map(attachments.map((a) => [a.id, a]));

    for (const [id, { resolve, reject }] of currentResolves) {
      // Remove from pending promises
      pendingPromises.delete(id);

      const result = resultsMap.get(id);
      if (result) {
        if (!result.meta?.inProgress) {
          cache.set(id, result);
        }
        resolve(result);
      } else if (idsNotFound.includes(id)) {
        cache.set(id, null);
        resolve(null);
      } else {
        reject(new Error('Attachment not found'));
      }
    }
  } catch (error) {
    for (const [id, { reject }] of currentResolves) {
      // Remove from pending promises
      pendingPromises.delete(id);
      reject(error);
    }
  }
}
