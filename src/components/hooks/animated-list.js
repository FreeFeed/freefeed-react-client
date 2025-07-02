import { useEffect, useRef, useState } from 'react';

/**
 * @typedef {'entering' | 'stable' | 'exiting'} State
 */

/**
 * @template T
 * @param {T[]} entries
 * @param {number} appearTimeout
 * @param {number} exitTimeout
 * @returns {{entry: T, state: State}[]}
 */
export function useAnimatedList(entries, appearTimeout = 0, exitTimeout = 300) {
  const [items, setItems] = useState([]);
  const prevEntriesRef = useRef([]);

  const [trackingEntries] = useState(() => new Map());

  // Cancel timeouts on unmount
  useEffect(() => () => trackingEntries.forEach((t) => clearTimeout(t)), [trackingEntries]);

  useEffect(() => {
    const newItems = diffEntriesWithOrder(prevEntriesRef.current, entries);

    // Schedule future transitions
    for (const { entry, state } of newItems) {
      if (state === 'stable' || trackingEntries.has(entry)) {
        continue;
      }
      let timer;
      if (state === 'entering') {
        timer = setTimeout(() => {
          // Transition 'entering' → 'stable'
          trackingEntries.delete(entry);
          setItems((items) =>
            items.map((it) => (it.entry === entry ? { ...it, state: 'stable' } : it)),
          );
        }, appearTimeout);
      } else {
        timer = setTimeout(() => {
          // Remove the 'exiting' item
          trackingEntries.delete(entry);
          setItems((items) => items.filter((it) => it.entry !== entry));
        }, exitTimeout);
      }
      trackingEntries.set(entry, timer);
    }

    setItems(newItems);
    prevEntriesRef.current = entries;

    // Ignore 'items' dependency here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  return items;
}

/**
 * Calculates diff between prev and current arrays, marking elements as
 * 'entering', 'stable', or 'exiting'. Keeps the order of elements.
 *
 * @template T
 * @param {T[]} prev - Previous array of entries
 * @param {T[]} current - Current array of entries
 * @returns {{entry: T, state: State}[]}
 */
function diffEntriesWithOrder(prev, current) {
  const prevSet = new Set(prev);
  const currentSet = new Set(current);

  /** @type {{entry: T, state: State}[]} */
  const result = [];
  let i = 0,
    j = 0;
  while (i < prev.length || j < current.length) {
    const prevEntry = prev[i];
    const currEntry = current[j];

    if (prevEntry === currEntry) {
      // Element is present in both, same position: stable
      result.push({ entry: prevEntry, state: 'stable' });
      i++;
      j++;
    } else if (currEntry !== undefined && !prevSet.has(currEntry)) {
      // Element present in current, but not in prev: entering
      result.push({ entry: currEntry, state: 'entering' });
      j++;
    } else if (prevEntry !== undefined && !currentSet.has(prevEntry)) {
      // Element present in prev, but not in current: exiting
      result.push({ entry: prevEntry, state: 'exiting' });
      i++;
    } else {
      // Conflict: element shifted, inserted, or other
      // Just treat current element as entering, prev will be handled later
      result.push({ entry: currEntry, state: 'entering' });
      j++;
    }
  }
  return result;
}
