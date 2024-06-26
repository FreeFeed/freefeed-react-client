import { describe, expect, it } from 'vitest';
import { compare, withRank } from '../../../../src/utils/sparse-match/rank';

describe('rank', () => {
  const testData = [
    {
      title: '1-chars query, 3-chars text',
      variants: ['*--', '-*-', '--*'],
    },
    {
      title: '2-chars query, 3-chars text',
      variants: ['**-', '-**', '*-*'],
    },
    {
      title: '3-chars query, 5-chars text',
      variants: ['***--', '**-*-', '-***-', '**--*', '*-**-', '--***', '-**-*', '*-*-*'],
    },
  ];

  for (const { title, variants } of testData) {
    it(`should test ${title}`, () => {
      const result = shuffleInPlace([...variants])
        .map((s) => withRank(s, matches(s)))
        .sort(compare)
        .map((x) => x.text);
      expect(result).toEqual(variants);
    });
  }
});

/**
 *
 * @param {string} s
 * @returns {number[]}
 */
function matches(s) {
  const matches = [];
  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '*') {
      matches.push(i);
    }
  }
  return matches;
}

function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
