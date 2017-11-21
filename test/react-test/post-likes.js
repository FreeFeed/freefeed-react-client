import test from 'tape';
import React from 'react';
import { createRenderer as createShallowRenderer } from 'react-addons-test-utils';

import PostLikes from '../../src/components/post-likes';

const renderLikes = (likes, omittedLikes = 0) => {
  const post = { omittedLikes };

  const renderer = createShallowRenderer();
  renderer.render(<PostLikes {...{ likes, post }} />);
  return renderer.getRenderOutput().props.children[1].props.children;
};

const getRenderedOmmitedLikes = (likes, omittedLikes) => {
  const likeList = renderLikes(likes, omittedLikes);
  const lastLike = likeList[likeList.length - 1];
  const [ommitedLikesNode] = lastLike.props.children;
  const [ommitedLikesNumber] = ommitedLikesNode.props.children;

  return ommitedLikesNumber;
};

test('PostLikes renders all likes', (t) => {
  const likes = [];

  for (let i = 0; i < 6; i++) {
    likes.push({});

    const renderedLikes = renderLikes(likes);

    t.equals(renderedLikes.length, likes.length);
  }

  t.end();
});

test('PostLikes renders omitted likes number', (t) => {
  const ommitLikes = 10;

  const ommitedLikes = getRenderedOmmitedLikes([{}], ommitLikes);

  t.equals(ommitedLikes, ommitLikes);

  t.end();
});
