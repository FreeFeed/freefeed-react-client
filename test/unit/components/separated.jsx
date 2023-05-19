import { describe, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import unexpected from 'unexpected';
import unexpectedReact from 'unexpected-react';
import { Separated } from '../../../src/components/separated';

const expect = unexpected.clone().use(unexpectedReact);

describe('<Separated>', () => {
  const testData = [
    {
      children: ['abc'],
      separator: ' ',
      result: <>abc</>,
    },
    {
      children: ['abc', 42],
      separator: ', ',
      result: (
        <>
          <>abc</>
          <>, 42</>
        </>
      ),
    },
    {
      children: ['abc', 42, false, 'def'],
      separator: ', ',
      lastSeparator: ' and ',
      result: (
        <>
          <>abc</>
          <>, 42</>
          <> and def</>
        </>
      ),
    },
  ];

  for (const { children, separator, lastSeparator, result } of testData) {
    it(`should format "${renderToStaticMarkup(result)}"`, () => {
      expect(<Separated {...{ children, separator, lastSeparator }} />, 'to render as', result);
    });
  }
});
