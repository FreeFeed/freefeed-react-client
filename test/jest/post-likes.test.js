import React from 'react';
import { shallow } from 'enzyme';

import PostLikes from '../../src/components/post-likes';

const renderPostLikes = (props = {}) => {
  const defaultProps = {};

  return shallow(<PostLikes {...defaultProps} {...props} />);
};

describe('<PostLikes>', () => {
  const post = { omittedLikes: 0 };

  for (let i = 1; i <= 6; i++) {
    const likes = [...Array(i)].map((a, i) => ({ id: `id${i}` }));

    it(`Should render ${i} likes if nothing is omitted`, () => {
      const actual = renderPostLikes({ likes, post });
      const postLikes = actual.find('.post-like');
      expect(postLikes.length).toEqual(i);
    });
  }

  it('Should render number of omitted likes', () => {
    const likes = [{ id: 'id0' }];
    const post = { omittedLikes: 10 };

    const actual = renderPostLikes({ likes, post });
    const moreLikesLink = actual.find('.more-post-likes-link');
    expect(moreLikesLink.text()).toEqual('10 other people');
  });
});
