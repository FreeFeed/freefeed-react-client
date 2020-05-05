import { describe, it } from 'mocha';
import expect from 'unexpected';

import { merge } from '../../../config/lib/merge';

describe('config', () => {
  describe('combine', () => {
    it(`should return patch if base or patch isn't an object`, () => {
      const testData = [
        { base: 'foo', patch: 'bar' },
        { base: 41, patch: 42 },
        { base: null, patch: 42 },
        { base: 41, patch: { foo: 'bar' } },
        { base: { foo: 'bar' }, patch: 42 },
      ];
      for (const { base, patch } of testData) {
        expect(merge(base, patch), 'to be', patch);
      }
    });

    it(`should combine patch with base with plain or object fields`, () => {
      const testData = [
        { base: { foo: 'bar' }, patch: { foo: 'baz' }, result: { foo: 'baz' } },
        { base: { foo: 'bar' }, patch: { bar: 'foo' }, result: { foo: 'bar', bar: 'foo' } },
        {
          base: { foo: { bar: 'baz', qux: 'qux' }, ose: 'ose' },
          patch: { foo: { qux: 'quux' } },
          result: { foo: { bar: 'baz', qux: 'quux' }, ose: 'ose' },
        },
      ];
      for (const { base, patch, result } of testData) {
        expect(merge(base, patch), 'to equal', result);
      }
    });
  });
});
