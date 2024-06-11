import { compare, withRank } from './rank';
import { sparseMatch } from './sparse-match';
import { TopN } from './top-n';

export class Finder {
  _topN;
  /**
   *
   * @param {string} query
   * @param {number} count
   */
  constructor(query, count) {
    this._topN = new TopN(count, compare);
    this.query = query;
  }

  /**
   *
   * @param {string} text
   */
  add(text) {
    const res = bestMatch(text, this.query);
    res && this._topN.add(res);
  }

  /**
   *
   * @returns {Ranked[]}
   */
  results() {
    return this._topN.data;
  }
}

/**
 * Returns best match for the given query in the given text with the rank
 *
 * @typedef {import('./rank').Ranked} Ranked
 * @param {string} text
 * @param {string} query
 * @returns {Ranked|null}
 */
function bestMatch(text, query) {
  const variants = sparseMatch(text, query).map((m) => withRank(text, m));
  if (variants.length === 0) {
    return null;
  }

  // eslint-disable-next-line prefer-destructuring
  let best = variants[0];
  for (let i = 1; i < variants.length; i++) {
    if (compare(variants[i], best) < 0) {
      best = variants[i];
    }
  }

  return best;
}
