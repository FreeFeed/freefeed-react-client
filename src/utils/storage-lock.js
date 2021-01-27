// Loosely based on Lamport's Fast Mutual Exclusion Algorithm
// https://www.microsoft.com/en-us/research/publication/fast-mutual-exclusion-algorithm/
// https://www.cs.rochester.edu/research/synchronization/pseudocode/fastlock.html

export class Lock {
  /**
   * @param {Storage} storage
   * @param {string} keyPrefix
   * @param {string} thisId
   * @param {number} lockInterval
   */
  constructor(storage, keyPrefix, thisId, lockInterval) {
    this.storage = storage;
    this.keyPrefix = keyPrefix;
    this.id = thisId;
    this.lockInterval = lockInterval;
  }

  try() {
    this._write('X');
    if (this._isLockedByOther('Y')) {
      return false;
    }
    this._write('Y');
    return !this._isLockedByOther('X');
  }

  _isLockedByOther(key) {
    const lk = this._read(key);
    return lk && lk.tab !== this.id && lk.time > Date.now() - this.lockInterval;
  }

  _read(key) {
    const data = this.storage.getItem(this.keyPrefix + key) || 'null';
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  _write(key) {
    this.storage.setItem(this.keyPrefix + key, JSON.stringify({ time: Date.now(), tab: this.id }));
  }
}
