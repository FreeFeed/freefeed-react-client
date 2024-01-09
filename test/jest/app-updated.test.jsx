/* global  describe, it, expect */
import { render } from '@testing-library/react';

import { AppUpdated } from '../../src/components/app-updated';
import { StateProvider } from './state-provider';

const defaultState = {
  appUpdated: {
    updated: true,
  },
};

describe('AppUpdated', () => {
  it('Renders if there is an update', () => {
    const { asFragment } = render(
      <StateProvider state={defaultState}>
        <AppUpdated />
      </StateProvider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
