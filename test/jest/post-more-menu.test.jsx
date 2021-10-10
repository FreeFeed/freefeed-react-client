/* global jest, describe, it, expect */
import { render } from '@testing-library/react';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';

import { PostMoreMenu } from '../../src/components/post-more-menu';

jest.mock('../../src/components/fontawesome-icons', () => ({
  Icon: ({ icon }) => `fontawesome icon ${icon.iconName}`, // mocking out icon to make snapshots smaller
}));

const VIEWER = {
  id: 'user-id',
  username: 'viewer',
  frontendPreferences: {
    timeDisplay: {},
  },
};

const POST = {
  id: 'post123',
  isEditable: false,
  canBeRemovedFrom: [],
  isModeratable: false,
  isDeletable: false,
  isModeratingComments: false,
  commentsDisabled: false,
  createdAt: '1629668000000',
  updatedAt: '1629668999999',
  isSaved: false,
  savePostStatus: {},
};

const defaultState = {
  user: VIEWER,
};

const renderPostMoreMenu = (props = {}) => {
  const { Provider } = reactRedux;
  const dummyReducer = (state) => state;
  const store = createStore(dummyReducer, defaultState);

  const defaultProps = {
    user: VIEWER,
    post: POST,
    toggleEditingPost: () => {},
    toggleModeratingComments: () => {},
    enableComments: () => {},
    disableComments: () => {},
    deletePost: () => {},
    perGroupDeleteEnabled: true,
    doAndClose: () => {},
    permalink: 'https://freefeed.net/post123',
    toggleSave: () => {},
  };

  return render(
    <Provider store={store}>
      <PostMoreMenu {...defaultProps} {...props} />
    </Provider>,
  );
};

describe('PostMoreMenu', () => {
  it('Renders a More menu for a logged-out visitor', () => {
    const { asFragment } = renderPostMoreMenu({ user: {} });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders a More menu for a logged-in reader', () => {
    const { asFragment } = renderPostMoreMenu();

    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders a More menu for a group moderator', () => {
    const { asFragment } = renderPostMoreMenu({
      post: {
        ...POST,
        isModeratable: true,
        canBeRemovedFrom: ['group1', 'group2'],
      },
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders a More menu for a post owner', () => {
    const { asFragment } = renderPostMoreMenu({
      post: {
        ...POST,
        isEditable: true,
        isDeletable: true,
      },
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
