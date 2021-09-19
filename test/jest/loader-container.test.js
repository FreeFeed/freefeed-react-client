/* global describe, it, expect */
import { render } from '@testing-library/react';

import LoaderContainer from '../../src/components/loader-container';

describe('AppUpdated', () => {
  it('Renders a full page loader', () => {
    const { asFragment } = render(
      <LoaderContainer loading fullPage>
        children
      </LoaderContainer>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
