import React from 'react';
import { shallow } from 'enzyme';

import UserProfile from '../../src/components/user-profile';

const renderUserProfile = (props = {}) => {
  const defaultProps = {
    id: 'user-id',
    type: 'user',
    username: 'username',
    screenName: 'ScreenName',
    profilePictureLargeUrl: 'profilePictureLargeUrl',
    description: 'description',
    amIGroupAdmin: false,
    isLoading: false,
    isUserFound: true,
    canISeeSubsList: true,
    statistics: {
      subscriptions: 10,
      subscribers: 20,
      comments: 30,
      likes: 40,
    },
    authenticated: true,
    isItMe: false,
    blocked: false,
    isPrivate: false,
    subscribed: true,
    hasRequestBeenSent: false,
    userView: {
      isSubscribing: false,
    },
    canAcceptDirects: true,
    canIPostHere: true,
    isRestricted: false,
    createPostViewState: () => {},
    sendTo: () => {},
    user: 'user',
    sendSubscriptionRequest: () => {},
    subscribe: () => {},
    unsubscribe: () => {},
    ban: () => {},
    createPost: () => {},
    resetPostCreateForm: () => {},
    expandSendTo: () => {},
    addAttachmentResponse: () => {},
  };

  return shallow(<UserProfile {...defaultProps} {...props} />);
};

describe('<UserProfile>', () => {
  it('Should render with default data', () => {
    const actual = renderUserProfile();
    expect(actual).toMatchSnapshot();
  });

  it('Should render when is a group', () => {
    const actual = renderUserProfile({
      type: 'group',
      amIGroupAdmin: true,
    });
    expect(actual).toMatchSnapshot();
  });

  it('Should render 404 when user is not found', () => {
    const actual = renderUserProfile({ isLoading: false, isUserFound: false });
    expect(actual).toMatchSnapshot();
  });

  it('Should render when private and not subscribed to', () => {
    const actual = renderUserProfile({ isPrivate: '1', subscribed: false });
    expect(actual).toMatchSnapshot();
  });

  it('Should not see links to subscription lists when canISeeSubsList is false', () => {
    const actual = renderUserProfile({ canISeeSubsList: false });
    expect(actual).toMatchSnapshot();
  });

  it('Should not show stats when user is blocked', () => {
    const actual = renderUserProfile({ blocked: true });
    expect(actual).toMatchSnapshot();
  });

  it('Should render a warning for a restricted group', () => {
    const actual = renderUserProfile({ type: 'group', canIPostHere: false, isRestricted: '1' });
    expect(actual).toMatchSnapshot();
  });

  it('Should block when block button is clicked', () => {
    const ban = jest.fn();
    const actual = renderUserProfile({ subscribed: false, ban });
    const blockButton = actual.find('.profile-action-block');
    const fakeClickEvent = { preventDefault: () => {} };

    blockButton.simulate('click', fakeClickEvent);
    expect(ban).toHaveBeenCalledTimes(1);
    expect(ban).toHaveBeenCalledWith({
      id: 'user-id',
      username: 'username',
    });
  });

  it('Should subscribe when subscribe button is clicked', () => {
    const subscribe = jest.fn();
    const actual = renderUserProfile({ subscribed: false, subscribe });
    const subscribeButton = actual.find('.subscribe-control-subscribe');
    const fakeClickEvent = { preventDefault: () => {} };

    subscribeButton.simulate('click', fakeClickEvent);
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(subscribe).toHaveBeenCalledWith({
      id: 'user-id',
      username: 'username',
    });
  });

  it('Should unsubscribe when unsubscribe button is clicked', () => {
    const unsubscribe = jest.fn();
    const actual = renderUserProfile({ subscribed: true, unsubscribe });
    const unsubscribeButton = actual.find('.subscribe-control-unsubscribe');
    const fakeClickEvent = { preventDefault: () => {} };

    unsubscribeButton.simulate('click', fakeClickEvent);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledWith({
      id: 'user-id',
      username: 'username',
    });
  });

  it('Should send a subscribe request when requesting subscription to a private user', () => {
    const sendSubscriptionRequest = jest.fn();
    const actual = renderUserProfile({
      subscribed: false,
      isPrivate: '1',
      sendSubscriptionRequest,
    });
    const subscriptionRequestButton = actual.find('.subscribe-control-request-subscription');
    const fakeClickEvent = { preventDefault: () => {} };

    subscriptionRequestButton.simulate('click', fakeClickEvent);
    expect(sendSubscriptionRequest).toHaveBeenCalledTimes(1);
    expect(sendSubscriptionRequest).toHaveBeenCalledWith({
      id: 'user-id',
      username: 'username',
    });
  });
});
