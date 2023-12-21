/* global describe, it, expect, vi, beforeEach */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';

import { ListEditor } from '../../src/components/friends-page/list-editor';

const LIST_ID = 'list-id';

const defaultState = {
  allSubscriptions: [
    { id: 'u1', homeFeeds: [LIST_ID] },
    { id: 'u2', homeFeeds: [LIST_ID, 'some-other-list'] },
    { id: 'u3', homeFeeds: ['some-other-list'] },
    { id: 'u4', homeFeeds: [] },
    { id: 'g1', homeFeeds: [LIST_ID] },
  ],
  homeFeeds: [
    {
      id: LIST_ID,
      title: 'My amazing list',
      isInherent: false,
    },
  ],
  users: {
    u1: { id: 'u1', type: 'user', username: 'in-list-1', screenName: 'In list' },
    u2: { id: 'u2', type: 'user', username: 'in-list-2', screenName: 'In multiple lists' },
    u3: { id: 'u3', type: 'user', username: 'not-in-list', screenName: 'In Some Other List' },
    u4: { id: 'u4', type: 'user', username: 'homeless', screenName: 'Homeless' },
    u5: { id: 'u5', type: 'user', username: 'unrelated', screenName: 'Not subscribed' },
    g1: { id: 'g1', type: 'group', username: 'group', screenName: 'A group' },
  },
  allSubscriptionsStatus: { success: true },
  crudHomeFeedStatus: { success: true },
};

const renderListEditor = (props = {}, options = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, defaultState);

  const defaultProps = {
    listId: LIST_ID,
    closeEditor: () => {},
  };

  const rendered = render(
    <Provider store={store}>
      <ListEditor {...defaultProps} {...props} />
    </Provider>,
    options,
  );

  return {
    ...rendered,
    rerender: (props = {}, options = {}) =>
      renderListEditor(props, { container: rendered.container, ...options }),
  };
};

describe('ListEditor', () => {
  const useSelectorMock = vi.spyOn(reactRedux, 'useSelector');
  const useDispatchMock = vi.spyOn(reactRedux, 'useDispatch');

  beforeEach(() => {
    useSelectorMock.mockClear();
    useDispatchMock.mockClear();
    useSelectorMock.mockImplementation((selector) => selector(defaultState));
    useDispatchMock.mockImplementation(() => () => {});
  });

  it("Renders a list and doesn't blow up", () => {
    renderListEditor();
    const listEditor = screen.getByTestId('list-editor');
    expect(listEditor).toMatchSnapshot();
  });

  it('Add a user to the list by clicking on it', async () => {
    renderListEditor();
    await userEvent.click(screen.getByText(/Not in the list/));
    expect(screen.getByText('Homeless')).toBeDefined();
    expect(screen.getByText('In Some Other List')).toBeDefined();
    expect(screen.getByText(/not in any of your friend lists/)).toBeDefined();
    expect(screen.queryByText('In list')).toBeNull();
    await userEvent.click(screen.getByText('Homeless'));
    expect(screen.queryByText('Homeless')).toBeNull();
    expect(screen.queryByText(/not in any of your friend lists/)).toBeNull();
  });

  it('Searches for users', async () => {
    renderListEditor();
    await userEvent.type(screen.getByRole('searchbox'), 'LIST');
    expect(screen.getByRole('list')).toMatchSnapshot();
  });
});
