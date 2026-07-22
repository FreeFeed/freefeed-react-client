import storage from 'local-storage-fallback';

function getStorageKey(mediaEl) {
  return `${mediaEl.tagName.toLowerCase()}-volume`;
}

function loadVolume(storageKey) {
  const stored = storage.getItem(storageKey);
  if (stored === null || stored.trim() === '') {
    return null;
  }

  const volume = Number(stored);
  return Number.isFinite(volume) && volume >= 0 && volume <= 1 ? volume : null;
}

export function bindMediaVolume(mediaEl) {
  const storageKey = getStorageKey(mediaEl);
  const storedVolume = loadVolume(storageKey);
  if (storedVolume !== null) {
    mediaEl.volume = storedVolume;
  }

  const saveVolume = () => storage.setItem(storageKey, mediaEl.volume.toString());
  mediaEl.addEventListener('volumechange', saveVolume);

  return () => mediaEl.removeEventListener('volumechange', saveVolume);
}
