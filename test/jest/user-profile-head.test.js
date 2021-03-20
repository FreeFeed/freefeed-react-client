/* global describe, it, expect, jest, beforeEach */
import { render, screen, fireEvent } from '@testing-library/react';
import * as reactRedux from 'react-redux';

import { UserProfileHead } from '../../src/components/user-profile-head';
import * as actionCreators from '../../src/redux/action-creators';

const USERNAME = 'freefeed';
const UID = 'f8e1e978-4df8-4160-b3da-99b8d49da2f8';
const OTHER_USERNAME = 'n1313';
const OTHER_UID = '004bf26e-f019-4230-b6ca-1aff6cf9784f';

const defaultState = {
  getUserInfoStatuses: {},
  routeLoadingState: false,
  // Current user
  user: {
    id: UID,
    username: USERNAME,
    type: 'user',
    subscriptions: [],
    subscribers: [],
    banIds: [],
    pendingSubscriptionRequests: [],
    administrators: [],
    frontendPreferences: {
      homefeed: { hideUsers: [] },
      pinnedGroups: [],
    },
  },
  users: {
    // Owner of the page
    [UID]: {
      id: UID,
      username: USERNAME,
      profilePictureUrl: 'profilePictureUrl',
      screenName: 'Shoop da whoop',
      isPrivate: '0',
      isProtected: '0',
      type: 'user',
      description: 'IMMA CHARGIN MAH LAZER',
      statistics: {
        subscribers: 1,
        subscriptions: 2,
        posts: 3,
        likes: 4,
        comments: 5,
      },
    },
  },
  directsReceivers: {
    [USERNAME]: true,
  },
  usersNotFound: [],
  usersInHomeFeeds: {},
  usersInHomeFeedsStates: {},
  homeFeeds: [{ id: 'home-feed-id' }],
  homeFeedsStatus: {},
  userActionsStatuses: {
    subscribing: {},
    pinned: {},
    hiding: {},
    blocking: {},
    unsubscribingFromMe: {},
  },
  updateUsersSubscriptionStates: {},
};

const renderUserProfileHead = (props = {}) => {
  const fakeRouter = {
    params: { userName: USERNAME },
    push: () => {},
    replace: () => {},
    go: () => {},
    goBack: () => {},
    goForward: () => {},
    setRouteLeaveHook: () => {},
    isActive: () => {},
  };
  const defaultProps = { router: fakeRouter };
  return render(<UserProfileHead {...defaultProps} {...props} />);
};

describe('UserProfileHead', () => {
  const useSelectorMock = jest.spyOn(reactRedux, 'useSelector');
  const useDispatchMock = jest.spyOn(reactRedux, 'useDispatch');

  beforeEach(() => {
    useSelectorMock.mockClear();
    useDispatchMock.mockClear();
    useSelectorMock.mockImplementation((selector) => selector(defaultState));
    useDispatchMock.mockImplementation(() => () => {});
  });

  it("Renders my own header and doesn't blow up", () => {
    const { asFragment } = renderUserProfileHead();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders nothing if user is not loaded yet', () => {
    const fakeState = {
      ...defaultState,
      users: {},
      getUserInfoStatuses: {
        [USERNAME]: {
          loading: true,
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    const { asFragment } = renderUserProfileHead();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders an error message if user is not found', () => {
    const fakeState = {
      ...defaultState,
      usersNotFound: [USERNAME],
      getUserInfoStatuses: {
        [USERNAME]: {
          error: true,
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    const { asFragment } = renderUserProfileHead();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Renders a message if user is gone', () => {
    const fakeState = {
      ...defaultState,
      users: {
        [UID]: {
          ...defaultState.users[UID],
          isGone: true,
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    renderUserProfileHead();
    expect(screen.getByText('Deleted user')).toBeDefined();
  });

  it("Correctly displays user's private status", () => {
    const fakeState = {
      ...defaultState,
      user: {},
      users: {
        [UID]: {
          ...defaultState.users[UID],
          isPrivate: '1',
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    renderUserProfileHead();
    expect(screen.getByText('Private feed')).toBeDefined();
  });

  it("Correctly displays user's protected status", () => {
    const fakeState = {
      ...defaultState,
      user: {},
      users: {
        [UID]: {
          ...defaultState.users[UID],
          isProtected: '1',
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    renderUserProfileHead();
    expect(screen.getByText('Protected feed')).toBeDefined();
  });

  it("Correctly displays user's blocked status and lets me unblock them", () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        banIds: [UID],
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));
    const unbanMock = jest.spyOn(actionCreators, 'unban');

    renderUserProfileHead();
    expect(screen.getByText('You’ve blocked this user')).toBeDefined();
    fireEvent.click(screen.getByText('Unblock'));
    expect(unbanMock).toHaveBeenCalledTimes(1);
    expect(unbanMock).toHaveBeenCalledWith(fakeState.users[UID]);
    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });

  it('Correctly displays that we are mutually subscribed', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        subscribers: [{ id: UID }],
        subscriptions: [UID],
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    const { asFragment } = renderUserProfileHead();
    expect(asFragment()).toMatchSnapshot();
  });

  it('Correctly displays that they are subscribed to me and that I can kick them out', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        subscribers: [{ id: UID }],
        isPrivate: '1',
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));
    const kickMock = jest.spyOn(actionCreators, 'unsubscribeFromMe');
    const confirmMock = jest.spyOn(global, 'confirm').mockReturnValueOnce(true);

    renderUserProfileHead();
    expect(screen.getByText('Subscribed to you')).toBeDefined();
    expect(screen.getByText('Subscribe')).toBeDefined();
    // fireEvent.click(screen.getByText('Subscribe'));
    // displaying UserSubscriptionEditPopup hangs tests inside useForm(), possibly
    // due to https://github.com/final-form/react-final-form-hooks/issues/51 or
    // https://github.com/final-form/react-final-form-hooks/issues/67

    fireEvent.click(screen.getByText('Remove from subscribers'));
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock).toHaveBeenCalledWith(
      'Are you sure you want to unsubscribe @freefeed from you?',
    );
    expect(kickMock).toHaveBeenCalledTimes(1);
    expect(kickMock).toHaveBeenCalledWith(fakeState.users[UID]);
    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });

  it('Correctly displays that I can send a subscription request', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
      },
      users: {
        [UID]: {
          ...defaultState.users[UID],
          isPrivate: '1',
        },
      },
      directsReceivers: [],
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    renderUserProfileHead();
    expect(screen.getByText('Request a subscription')).toBeDefined();
    // fireEvent.click(screen.getByText('Request a subscription'));
    // same as above
    expect(screen.queryByText('Direct message')).toBeNull();
  });

  it('Correctly displays that I can revoke a previously sent subscription request', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        pendingSubscriptionRequests: [UID],
      },
      users: {
        [UID]: {
          ...defaultState.users[UID],
          isPrivate: '1',
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));
    const revokeMock = jest.spyOn(actionCreators, 'revokeSentRequest');
    const confirmMock = jest.spyOn(global, 'confirm').mockReturnValueOnce(true);

    renderUserProfileHead();
    expect(screen.getByText('revoke')).toBeDefined();
    fireEvent.click(screen.getByText('revoke'));
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock).toHaveBeenCalledWith('Are you sure you want to revoke this request?');
    expect(revokeMock).toHaveBeenCalledTimes(1);
    expect(revokeMock).toHaveBeenCalledWith(fakeState.users[UID]);
    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });

  it('Correctly displays that I am subscribed to them and lets me unsubscribe', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        subscriptions: [UID],
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));
    const unsubscribeMock = jest.spyOn(actionCreators, 'unsubscribe');
    const confirmMock = jest.spyOn(global, 'confirm').mockReturnValueOnce(true);

    renderUserProfileHead();
    expect(screen.getByText('You are subscribed')).toBeDefined();
    fireEvent.click(screen.getByText('Unsubscribe'));
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock).toHaveBeenCalledWith(
      'Are you sure you want to unsubscribe from @freefeed?',
    );
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    expect(unsubscribeMock).toHaveBeenCalledWith(fakeState.users[UID]);
    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });

  it("Correctly displays user's hidden status and lets me unhide them", () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        frontendPreferences: {
          ...defaultState.user.frontendPreferences,
          homefeed: {
            hideUsers: [USERNAME],
          },
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));
    const unhideMock = jest.spyOn(actionCreators, 'hideByName');

    renderUserProfileHead();
    expect(screen.getByText('Unhide in Home')).toBeDefined();
    fireEvent.click(screen.getByText('Unhide in Home'));
    expect(unhideMock).toHaveBeenCalledTimes(1);
    expect(unhideMock).toHaveBeenCalledWith(USERNAME, null, false);
    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });

  it('Correctly displays that user is in some of my lists', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        subscriptions: [UID],
      },
      usersInHomeFeedsStates: {
        [USERNAME]: {
          success: true,
        },
      },
      usersInHomeFeeds: {
        [UID]: ['f1', 'home'],
      },
      homeFeeds: [
        { id: 'f1', title: 'Feed 1' },
        { id: 'f2', title: 'Feed 2' },
        { id: 'home', title: 'Home feed', isInherent: true },
      ],
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    renderUserProfileHead();
    expect(screen.getByText('Feed 1')).toBeDefined();
    expect(screen.queryByText('Feed 2')).toBeNull();
    expect(screen.getByText('Home feed')).toBeDefined();
  });

  it('Renders a group header and lets me pin it', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        subscriptions: [UID],
      },
      users: {
        [UID]: {
          ...defaultState.users[UID],
          type: 'group',
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));
    const pinMock = jest.spyOn(actionCreators, 'togglePinnedGroup');

    renderUserProfileHead();
    expect(screen.getByText('Public group')).toBeDefined();
    expect(screen.getByText('You are a member')).toBeDefined();
    expect(screen.getByText('Invite')).toBeDefined();
    expect(screen.getByText('Pin to sidebar')).toBeDefined();
    fireEvent.click(screen.getByText('Pin to sidebar'));
    expect(pinMock).toHaveBeenCalledTimes(1);
    expect(pinMock).toHaveBeenCalledWith(UID);
    expect(useDispatchMock).toHaveBeenCalledTimes(1);
  });

  it('Renders a group header if I am an admin', () => {
    const fakeState = {
      ...defaultState,
      user: {
        ...defaultState.user,
        id: OTHER_UID,
        username: OTHER_USERNAME,
        subscriptions: [UID],
      },
      users: {
        [UID]: {
          ...defaultState.users[UID],
          administrators: [OTHER_UID],
          type: 'group',
          isPrivate: '1',
        },
      },
    };
    useSelectorMock.mockImplementation((selector) => selector(fakeState));

    renderUserProfileHead();
    expect(screen.getByText('Private group')).toBeDefined();
    expect(screen.getByText('You are an admin')).toBeDefined();
    expect(screen.getByText('Group settings')).toBeDefined();
    expect(screen.getByText('Manage members')).toBeDefined();
    expect(screen.queryByText('Unsubscribe')).toBeNull();
  });
});
