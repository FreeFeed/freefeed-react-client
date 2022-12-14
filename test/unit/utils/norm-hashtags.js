import { describe, it } from 'mocha';
import expect from 'unexpected';
import { normalizeHashtag } from '../../../src/utils/norm-hashtags';

describe('normalizeHashtag', () => {
  const testData = [
    ['ababa', 'ababa'],
    ['#3pm-4am', '#3pm4am'],
    ['ёлка-йоґ', 'елкайог'],
  ];

  for (const [source, result] of testData) {
    it(`should normalize ${JSON.stringify(source)} to ${JSON.stringify(result)}`, () =>
      expect(normalizeHashtag(source), 'to be', result));
  }
});
