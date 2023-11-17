/* global vi, describe, it, expect */
import { render } from '@testing-library/react';
import { createStore } from 'redux';
import * as reactRedux from 'react-redux';

import { PostMoreMenu } from '../../src/components/post/post-more-menu';
import { initialAsyncState } from '../../src/redux/async-helpers';

vi.mock('../../src/components/fontawesome-icons', () => ({
  Icon: ({ icon }) => `fontawesome icon ${icon.iconName}`, // mocking out icon to make snapshots smaller
}));

const VIEWER = {
  id: 'user-id',
  username: 'viewer',
  frontendPreferences: {
    timeDisplay: {},
  },
};

const AUTHOR = {
  ...VIEWER,
  id: 'user-id2',
  username: 'author',
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
  createdBy: AUTHOR,
  isDirect: false,
};

const defaultState = {
  user: VIEWER,
  serverInfoStatus: initialAsyncState,
  posts: {},
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
    doAndClose: () => {},
    doAndForceClose: () => {},
    permalink: 'https://freefeed.net/post123',
    toggleSave: () => {},
    doMention: () => {},
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
        createdBy: VIEWER,
      },
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
