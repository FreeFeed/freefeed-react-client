/* global describe, expect, it */
import { render } from '@testing-library/react';
import { Expandable } from '../../src/components/expandable';
import { StateProvider } from './state-provider';

describe('<Expandable>', () => {
  it('aligns the max height to the bottom of the line box', () => {
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    const originalGetClientRects = Range.prototype.getClientRects;

    HTMLElement.prototype.getBoundingClientRect = () => ({
      top: 100,
      width: 624,
      height: 200,
    });
    Range.prototype.getClientRects = () => [
      { top: 200, bottom: 212, height: 12 },
      { top: 216, bottom: 228, height: 12 },
    ];

    try {
      const { container } = render(
        <StateProvider state={{ authenticated: true, uiScale: 100 }}>
          <Expandable>
            <span style={{ lineHeight: '16px' }}>Content</span>
          </Expandable>
        </StateProvider>,
      );

      expect(container.firstElementChild).toHaveStyle({ maxHeight: '130px' });
    } finally {
      HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
      if (originalGetClientRects) {
        Range.prototype.getClientRects = originalGetClientRects;
      } else {
        delete Range.prototype.getClientRects;
      }
    }
  });
});
