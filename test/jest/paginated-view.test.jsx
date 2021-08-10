/* global describe, it, expect */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';

import PaginatedView from '../../src/components/paginated-view';

const defaultState = {
  routing: {
    locationBeforeTransitions: {
      pathname: '/filter/everything',
      search: '?offset=30',
      hash: '',
      action: 'POP',
      key: 'l5ugbx',
      query: {
        offset: '30',
      },
    },
  },
  feedViewState: {
    isLastPage: false,
  },
};

const renderPaginatedView = (props = {}, options = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, defaultState);

  const defaultProps = {
    children: <div>Paginated feed</div>,
  };

  const rendered = render(
    <Provider store={store}>
      <PaginatedView {...defaultProps} {...props} />
    </Provider>,
    options,
  );

  return {
    ...rendered,
    rerender: (props = {}, options = {}) =>
      renderPaginatedView(props, { container: rendered.container, ...options }),
  };
};

describe('PaginatedView', () => {
  it('Renders paginated view with links to newer and older entries', () => {
    const { asFragment } = renderPaginatedView();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders user summary links', () => {
    renderPaginatedView({
      params: { days: 7 },
      boxHeader: { title: 'Box title' },
      viewUser: { username: 'author' },
      showSummaryHeader: true,
    });
    expect(screen.getByRole('heading')).toMatchSnapshot();
  });
});
