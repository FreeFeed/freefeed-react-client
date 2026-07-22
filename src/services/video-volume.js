import storage from 'local-storage-fallback';

const STORAGE_KEY = 'video-volume';

function loadVolume() {
  const stored = storage.getItem(STORAGE_KEY);
  if (stored === null || stored.trim() === '') {
    return null;
  }

  const volume = Number(stored);
  return Number.isFinite(volume) && volume >= 0 && volume <= 1 ? volume : null;
}

export function bindVideoVolume(videoEl) {
  const storedVolume = loadVolume();
  if (storedVolume !== null) {
    videoEl.volume = storedVolume;
  }

  const saveVolume = () => storage.setItem(STORAGE_KEY, videoEl.volume.toString());
  videoEl.addEventListener('volumechange', saveVolume);

  return () => videoEl.removeEventListener('volumechange', saveVolume);
}
