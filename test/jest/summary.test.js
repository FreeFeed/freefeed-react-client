/* global describe, it, expect */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';

import Summary from '../../src/components/summary';

const USER = { id: 'user-id', username: 'user', frontendPreferences: {} };

const defaultState = {
  routeLoadingState: false,
  authenticated: true,
  boxHeader: 'Best of the day',
  user: USER,
  users: {
    [USER.id]: USER,
  },
  feedViewState: {
    entries: [],
  },
  posts: {},
  postsViewState: {},
  routing: {},
};

const renderSummary = (props = {}, options = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, defaultState);

  const defaultProps = {
    params: { days: 7 },
  };

  const rendered = render(
    <Provider store={store}>
      <Summary {...defaultProps} {...props} />
    </Provider>,
    options,
  );

  return {
    ...rendered,
    rerender: (props = {}, options = {}) =>
      renderSummary(props, { container: rendered.container, ...options }),
  };
};

describe('Summary', () => {
  it('Renders summary view with an empty feed', () => {
    const { asFragment } = renderSummary();
    expect(asFragment()).toMatchSnapshot();
  });
});
