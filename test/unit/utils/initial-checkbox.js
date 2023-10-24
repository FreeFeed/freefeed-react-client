import { describe, it } from 'vitest';
import expect from 'unexpected';
import { checkMark, hasCheckbox, setCheckState } from '../../../src/utils/initial-checkbox';

describe('Checkboxes in texts', () => {
  describe('hasCheckbox()', () => {
    const testData = [
      { text: `[] a box`, result: true },
      { text: `[ ] a box`, result: true },
      { text: `[\t] a box`, result: true },
      { text: `[  ] a box`, result: true },
      { text: `[x] a box`, result: true },
      { text: `[X] a box`, result: true },
      { text: `[v] a box`, result: true },
      { text: `[V] a box`, result: true },
      { text: `[*] a box`, result: true },
      { text: `[\u2713] a box`, result: true },
      { text: `[\u2714] a box`, result: true },
      { text: `[\u0445] a box`, result: true },
      { text: `[\u0425] a box`, result: true },
      { text: `[x ] a box`, result: false },
      { text: `[x] a box []`, result: false },
      { text: `[] a box []`, result: false },
    ];

    for (const { text, result } of testData) {
      it(`should return ${JSON.stringify(result)} for "${text}"`, () => {
        expect(hasCheckbox(text), 'to be', result);
      });
    }
  });

  describe('setCheckState()', () => {
    const testData = [
      { text: `[x] a box`, newState: true, result: `[${checkMark}] a box` },
      { text: `[x] a box`, newState: false, result: `[ ] a box` },
      { text: `[ ] a box`, newState: true, result: `[${checkMark}] a box` },
      { text: `[ ] a box`, newState: false, result: `[ ] a box` },
      { text: `[] a box`, newState: true, result: `[${checkMark}] a box` },
      { text: `[] a box`, newState: false, result: `[ ] a box` },
      { text: `not a box`, newState: true, result: `not a box` },
      { text: `not a box`, newState: false, result: `not a box` },
    ];

    for (const { text, newState, result } of testData) {
      it(`should return "${result}" for "${text}" and new state of ${JSON.stringify(
        newState,
      )}`, () => {
        expect(setCheckState(text, newState), 'to equal', result);
      });
    }
  });
});
