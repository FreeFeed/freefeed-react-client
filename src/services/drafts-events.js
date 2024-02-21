// @ts-check

/**
 * @template T
 * @typedef {(data:T)=>void} Listener
 */

/**
 * @template T
 */
export class EventEmitter {
  /** @type {Set<Listener<T>>}*/
  listeners = new Set();

  /**
   * @param {Listener<T>} listener
   * @returns {() => void}
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * @param {T} data
   */
  emit(data) {
    for (const listener of this.listeners) {
      listener(data);
    }
  }
}
