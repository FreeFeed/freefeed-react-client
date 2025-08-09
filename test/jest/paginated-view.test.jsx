/* global describe, it, expect */
import { render, screen } from '@testing-library/react';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';
import { createMemoryHistory } from 'history';

import PaginatedView from '../../src/components/paginated-view';
import { Router } from '../../src/services/nouter';

const defaultState = {
  feedViewState: {
    isLastPage: false,
  },
};

const history = createMemoryHistory({ initialEntries: ['/filter/everything?offset=30'] });

const renderPaginatedView = (props = {}, options = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, defaultState);

  const defaultProps = {
    children: <div>Paginated feed</div>,
  };

  const rendered = render(
    <Router history={history}>
      <Provider store={store}>
        <PaginatedView {...defaultProps} {...props} />
      </Provider>
    </Router>,
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
