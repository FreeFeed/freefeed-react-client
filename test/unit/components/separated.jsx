import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Separated } from '../../../src/components/separated';

describe('<Separated>', () => {
  const testData = [
    {
      children: ['abc'],
      separator: ' ',
      expected: 'abc',
    },
    {
      children: ['abc', 42],
      separator: ', ',
      expected: 'abc, 42',
    },
    {
      children: ['abc', 42, false, 'def'],
      separator: ', ',
      lastSeparator: ' and ',
      expected: 'abc, 42 and def',
    },
  ];

  for (const { children, separator, lastSeparator, expected } of testData) {
    it(`should format "${expected}"`, () => {
      const { container } = render(<Separated {...{ children, separator, lastSeparator }} />);
      expect(container.textContent).toBe(expected);
    });
  }
});
