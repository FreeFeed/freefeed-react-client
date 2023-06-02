/* global  vi, describe, it, expect, beforeEach, afterEach */
import { render, act } from '@testing-library/react';
import { Throbber, SMALL, BIG } from '../../src/components/throbber';

// Create a fake canvas context
HTMLCanvasElement.prototype.getContext = () => ({
  scale: () => {},
});

describe('Throbber', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Renders in small size', () => {
    const { asFragment } = render(<Throbber size={SMALL} className="my-humble-throbber" />);
    act(() => void vi.advanceTimersByTime(500));

    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders in big size', () => {
    const { asFragment } = render(<Throbber size={BIG} className="my-enormous-throbber" />);
    act(() => void vi.advanceTimersByTime(500));

    expect(asFragment()).toMatchSnapshot();
  });
});
