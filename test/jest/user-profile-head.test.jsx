/* global describe, it, expect, vi, beforeEach */
import { render, screen, fireEvent } from '@testing-library/react';

import { applyMiddleware } from 'redux';
import { UserProfileHead } from '../../src/components/user-profile-head';
import * as actionCreators from '../../src/redux/action-creators';
import { successAsyncState } from '../../src/redux/async-helpers';
import {
  HIDE_BY_CRITERION,
  REVOKE_USER_REQUEST,
  TOGGLE_PINNED_GROUP,
  UNBAN,
  UNSUBSCRIBE,
  UNSUBSCRIBE_FROM_ME,
} from '../../src/redux/action-types';
import { USERNAME as CRIT_USERNAME } from '../../src/utils/hide-criteria';
import { StateProvider } from './state-provider';

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
      timeDisplay: {},
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
      createdAt: '1430708710865',
      updatedAt: '1647366122559',
      youCan: [],
    },
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
  invitedByMap: {},
  userStatsStatus: successAsyncState,
  userStats: {
    subscribers: 1,
    subscriptions: 2,
    posts: 3,
    likes: 4,
    comments: 5,
  },
};

const renderUserProfileHead = (state = defaultState, dispatchSpy) => {
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

  const enhancer = applyMiddleware(() => (next) => (action) => {
    dispatchSpy?.(action);
    return next(action);
  });

  return render(
    <StateProvider state={state} enhancer={enhancer}>
      <UserProfileHead {...defaultProps} />
    </StateProvider>,
  );
};

describe('UserProfileHead', () => {
  const dispatchSpy = vi.fn();

  beforeEach(() => {
    dispatchSpy.mockClear();
  });

  it("Renders my own header and doesn't blow up", () => {
    const { asFragment } = renderUserProfileHead(defaultState);
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

    const { asFragment } = renderUserProfileHead(fakeState);
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

    const { asFragment } = renderUserProfileHead(fakeState);
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

    renderUserProfileHead(fakeState);
    expect(screen.getByText('Deleted user')).toBeDefined();
  });

  it("Correctly displays user's private status", () => {
    const fakeState = {
      ...defaultState,
      users: {
        [UID]: {
          ...defaultState.users[UID],
          isPrivate: '1',
        },
      },
    };

    renderUserProfileHead(fakeState);
    expect(screen.getByText('Private feed')).toBeDefined();
  });

  it("Correctly displays user's protected status", () => {
    const fakeState = {
      ...defaultState,
      users: {
        [UID]: {
          ...defaultState.users[UID],
          isProtected: '1',
        },
      },
    };

    renderUserProfileHead(fakeState);
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
    const unbanMock = vi.spyOn(actionCreators, 'unban');

    renderUserProfileHead(fakeState, dispatchSpy);
    expect(screen.getByText('You’ve blocked this user')).toBeDefined();
    fireEvent.click(screen.getByText('Unblock'));
    expect(unbanMock).toHaveBeenCalledTimes(1);
    expect(unbanMock).toHaveBeenCalledWith(fakeState.users[UID]);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: UNBAN }));
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
      users: { [UID]: { ...defaultState.users[UID], youCan: ['dm', 'unsubscribe'] } },
    };

    const { asFragment } = renderUserProfileHead(fakeState);
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
    const kickMock = vi.spyOn(actionCreators, 'unsubscribeFromMe');
    const confirmMock = vi.spyOn(global, 'confirm').mockReturnValueOnce(true);

    renderUserProfileHead(fakeState, dispatchSpy);
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
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: UNSUBSCRIBE_FROM_ME }),
    );
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
    };

    renderUserProfileHead(fakeState);
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
    const revokeMock = vi.spyOn(actionCreators, 'revokeSentRequest');
    const confirmMock = vi.spyOn(global, 'confirm').mockReturnValueOnce(true);

    renderUserProfileHead(fakeState, dispatchSpy);
    expect(screen.getByText('revoke')).toBeDefined();
    fireEvent.click(screen.getByText('revoke'));
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock).toHaveBeenCalledWith('Are you sure you want to revoke this request?');
    expect(revokeMock).toHaveBeenCalledTimes(1);
    expect(revokeMock).toHaveBeenCalledWith(fakeState.users[UID]);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: REVOKE_USER_REQUEST }),
    );
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
    const unsubscribeMock = vi.spyOn(actionCreators, 'unsubscribe');
    const confirmMock = vi.spyOn(global, 'confirm').mockReturnValueOnce(true);

    renderUserProfileHead(fakeState, dispatchSpy);
    expect(screen.getByText('You are subscribed')).toBeDefined();
    fireEvent.click(screen.getByText('Unsubscribe'));
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(confirmMock).toHaveBeenCalledWith(
      'Are you sure you want to unsubscribe from @freefeed?',
    );
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
    expect(unsubscribeMock).toHaveBeenCalledWith(fakeState.users[UID]);
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: UNSUBSCRIBE }));
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
    const unhideMock = vi.spyOn(actionCreators, 'hidePostsByCriterion');

    renderUserProfileHead(fakeState, dispatchSpy);
    expect(screen.getByText('Unhide in Home')).toBeDefined();
    fireEvent.click(screen.getByText('Unhide in Home'));
    expect(unhideMock).toHaveBeenCalledTimes(1);
    expect(unhideMock).toHaveBeenCalledWith({ type: 'USERNAME', value: USERNAME }, null, false);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: HIDE_BY_CRITERION,
        payload: {
          criterion: {
            type: CRIT_USERNAME,
            value: USERNAME,
          },
          doHide: false,
          postId: null,
        },
      }),
    );
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

    renderUserProfileHead(fakeState);
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
    const pinMock = vi.spyOn(actionCreators, 'togglePinnedGroup');

    renderUserProfileHead(fakeState, dispatchSpy);
    expect(screen.getByText('Public group')).toBeDefined();
    expect(screen.getByText('You are a member')).toBeDefined();
    fireEvent.click(screen.getByText('Group actions'));
    expect(screen.getByText('Invite')).toBeDefined();
    expect(screen.getByText('Pin to sidebar')).toBeDefined();
    fireEvent.keyDown(screen.getByText('Pin to sidebar'), { keyCode: 13 });
    expect(pinMock).toHaveBeenCalledTimes(1);
    expect(pinMock).toHaveBeenCalledWith(UID);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: TOGGLE_PINNED_GROUP,
        payload: { id: UID },
      }),
    );
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

    renderUserProfileHead(fakeState);
    expect(screen.getByText('Private group')).toBeDefined();
    expect(screen.getByText('You are an admin')).toBeDefined();
    expect(screen.getByText('Group settings')).toBeDefined();
    expect(screen.getByText('Manage members')).toBeDefined();
    expect(screen.queryByText('Unsubscribe')).toBeNull();
  });
});
