/**
 * Returns all possible matches for the given query in the given text. Returning
 * an indices of the found characters.
 *
 * ```
 * {
 *    text: 'abba cat',
 *    query: 'abc',
 *    expected: [
 *      "[ab]ba [c]at", // [0, 1, 5]
 *      "[a]b[b]a [c]at", // [0, 2, 5]
 *    ],
 *  }
 * ```
 *
 * @param {string} text
 * @param {string} query
 * @param {number} start
 * @returns {number[][]}
 */
export function sparseMatch(text, query, start = 0) {
  if (!query || text.length < query.length + start) {
    return [];
  }

  /**
   * @type {number[][]}
   */
  const results = [];
  const nextQuery = query.slice(1);
  let idx = start;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const p = text.indexOf(query[0], idx);
    if (p === -1) {
      break;
    }
    idx = p + 1;

    if (nextQuery) {
      const next = sparseMatch(text, nextQuery, idx);
      for (const it of next) {
        it.unshift(p);
        results.push(it);
      }
    } else {
      results.push([p]);
    }
  }

  return results;
}
