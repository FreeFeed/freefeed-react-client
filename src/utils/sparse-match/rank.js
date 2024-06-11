/**
 * @typedef {{ text: string; matches: number[]; rank: number }} Ranked
 */

/**
 *
 * @param {string} text
 * @param {number[]} matches
 * @returns {Ranked}
 */
export function withRank(text, matches) {
  return { text, matches, rank: matchRank(matches, text.length) };
}

/**
 *
 * @param {Ranked} a
 * @param {Ranked} b
 * @returns {number}
 */
export function compare(a, b) {
  if (a.rank === b.rank) {
    return a.text.localeCompare(b.text);
  }
  return b.rank - a.rank;
}

/**
 * Calculates the absolute rank of the given matches
 *
 * @param {number[]} matches
 * @param {number} textLength
 * @returns {number}
 */
function matchRank(matches, textLength) {
  // The maximal possible rank with this count of matches: all matches are in
  // the beginning of the text.
  const maxRank = calcRank([...Array(matches.length).keys()], matches.length);
  return calcRank(matches, textLength) - maxRank;
}

/**
 * Calculates the raw rank of the given matches
 *
 * @param {number[]} matches - array of matched characters indices
 * @param {number} textLength - text length
 * @returns {number}
 */
function calcRank(matches, textLength) {
  const positionWeight = 2;
  const jointWeight = 2.5;
  // Weight of a missed character
  const missWeight = 0.1;

  // Total (negative) weight of all missed characters
  let rank = missWeight * (-textLength + matches.length);
  let prevMatch = -2; // Fake value of previous match
  for (const m of matches) {
    // Positional weight of the current match
    rank += (2 * positionWeight) / (1 + m);
    if (prevMatch === m - 1) {
      // Increase weight of consecutive matches
      rank += jointWeight;
    }
    prevMatch = m;
  }

  return rank / matches.length;
}
