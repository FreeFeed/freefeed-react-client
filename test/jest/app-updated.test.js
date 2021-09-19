/* global jest, describe, it, expect */
import { render } from '@testing-library/react';
import * as reactRedux from 'react-redux';

import { AppUpdated } from '../../src/components/app-updated';

const defaultState = {
  appUpdated: {
    updated: true,
  },
};

describe('AppUpdated', () => {
  it('Renders if there is an update', () => {
    const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
    useSelectorMock.mockImplementation((selector) => selector(defaultState));

    const { asFragment } = render(<AppUpdated />);
    expect(asFragment()).toMatchSnapshot();
  });
});
