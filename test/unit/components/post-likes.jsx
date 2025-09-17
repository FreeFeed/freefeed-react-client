/* global describe, it, expect, vi */
import { render, screen } from '@testing-library/react';
import { clone } from 'lodash-es';

import PostLikes from '../../../src/components/post/post-likes';

// Mock UserName component, we don't need it in this tests
vi.mock('../../../src/components/user-name', () => ({
  __esModule: true,
  default: ({ user }) => <span>{user.username}</span>,
}));

describe('<PostLikes>', () => {
  const _likes = [];

  for (let i = 1; i <= 6; i++) {
    _likes.push({ id: `id${i}`, username: `user${i}` });

    const likes = clone(_likes);
    it(`should render ${i} likes if nothing is omitted`, () => {
      const post = { omittedLikes: 0 };

      render(<PostLikes likes={likes} post={post} />);

      // In the component, each like is rendered as a list item
      const likeItems = screen.getAllByRole('listitem');
      expect(likeItems).toHaveLength(i);
    });
  }

  it('should render number of omitted likes', () => {
    const likes = [{ id: 'id0', username: 'user0' }];
    const post = { omittedLikes: 10 };

    render(<PostLikes likes={likes} post={post} />);

    // The component should render a link with text like "10 other people"
    const omittedLikesLink = screen.getByText('10 other people');
    expect(omittedLikesLink).toBeInTheDocument();

    // There should be two list items: one for the visible like, one for the omitted likes link
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });
});
