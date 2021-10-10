/* global jest, describe, it, expect, beforeEach, afterEach */
import { render, act } from '@testing-library/react';

import { Throbber, SMALL, BIG } from '../../src/components/throbber';

describe('Throbber', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Renders in small size', () => {
    const { asFragment } = render(<Throbber size={SMALL} className="my-humble-throbber" />);
    act(() => jest.advanceTimersByTime(500));

    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders in big size', () => {
    const { asFragment } = render(<Throbber size={BIG} className="my-enormous-throbber" />);
    act(() => jest.advanceTimersByTime(500));

    expect(asFragment()).toMatchSnapshot();
  });
});
