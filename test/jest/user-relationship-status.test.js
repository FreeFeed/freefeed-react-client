/* global describe, it, expect */
import { render } from '@testing-library/react';

import UserRelationshipStatus from '../../src/components/user-relationships-status';

describe('UserRelationshipStatus', () => {
  it('Shows that I have blocked them', () => {
    const { asFragment } = render(<UserRelationshipStatus isUserBlockedByMe />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows that they have blocked me', () => {
    const { asFragment } = render(<UserRelationshipStatus amIBlockedByUser />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows that I have sent them a subscription request', () => {
    const { asFragment } = render(<UserRelationshipStatus hasRequestBeenSent />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows that we are mutually subscribed', () => {
    const { asFragment } = render(
      <UserRelationshipStatus amISubscribedToUser isUserSubscribedToMe type="user" />,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows that I am subscribed to them', () => {
    const { asFragment } = render(<UserRelationshipStatus amISubscribedToUser type="user" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows that they are subscribed to me', () => {
    const { asFragment } = render(<UserRelationshipStatus isUserSubscribedToMe />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows that I am a group member', () => {
    const { asFragment } = render(<UserRelationshipStatus amISubscribedToUser type="group" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('Shows that I am a group admin', () => {
    const { asFragment } = render(
      <UserRelationshipStatus amISubscribedToUser amIGroupAdmin type="group" />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
