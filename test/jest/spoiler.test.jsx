/* global describe, it, expect */
import { render, screen, fireEvent } from '@testing-library/react';

import Spoiler from '../../src/components/spoiler';

describe('Spoiler', () => {
  it('Renders correctly', () => {
    const { asFragment } = render(<Spoiler>Aeris dies</Spoiler>);

    expect(asFragment()).toMatchSnapshot();

    fireEvent.click(screen.getByTitle('This is a spoiler. Click to reveal its contents.'));
    expect(asFragment()).toMatchSnapshot();
  });
});
