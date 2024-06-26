import { describe, it } from 'vitest';
import expect from 'unexpected';
import { sparseMatch } from '../../../../src/utils/sparse-match/sparse-match';

describe('sparseMatch', () => {
  const testCases = [
    {
      text: 'abba cat',
      query: 'abc',
      // prettier-ignore
      expected: [
        "[ab]ba [c]at",
        "[a]b[b]a [c]at",
      ],
    },
    {
      text: 'abbabba',
      query: 'babb',
      // prettier-ignore
      expected: [
        "a[b]b[abb]a",
        "ab[babb]a",
      ],
    },
    {
      text: 'без кокошника',
      query: 'кошка',
      // prettier-ignore
      expected: [
        "без [ко]ко[ш]ни[ка]",
        "без [к]ок[ош]ни[ка]",
        "без ко[кош]ни[ка]",
      ],
    },
    { text: 'ab', query: 'aba', expected: [] },
    { text: 'aba', query: 'aba', expected: ['[aba]'] },
  ];

  for (const { text, query, expected } of testCases) {
    it(`matching ${JSON.stringify(text)} against ${JSON.stringify(query)}`, () => {
      const actual = sparseMatch(text, query).map((p) => hlPositions(text, p));
      expect(actual, 'to equal', expected);
    });
  }
});

/**
 *
 * @param {string} text
 * @param {number[]} positions
 * @returns {string}
 */
function hlPositions(text, positions) {
  return text
    .split('')
    .map((c, i) => {
      if (positions.includes(i)) {
        if (!positions.includes(i - 1)) {
          c = `[${c}`;
        }
        if (!positions.includes(i + 1)) {
          c = `${c}]`;
        }
      }
      return c;
    })
    .join('');
}
