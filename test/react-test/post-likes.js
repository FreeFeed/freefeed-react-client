import test from 'tape';
import React from 'react';

import PostLikes from 'src/components/post-likes';
import sd from 'skin-deep';

const renderLikes = (likes, omittedLikes = 0) => {
  const post = {omittedLikes};

  const tree = sd.shallowRender(React.createElement(PostLikes, {likes, post}));
  return tree.getRenderOutput().props.children[1].props.children;
};

const getRenderedOmmitedLikes = (likes, omittedLikes) => {

  const likeList = renderLikes(likes, omittedLikes);

  const lastLike = likeList[likeList.length - 1];

  const ommitedLikesNode = lastLike.props.children[0];

  const ommitedLikesNumber = ommitedLikesNode.props.children[0];

  return ommitedLikesNumber;
};

test('PostLikes renders all likes', t => {

  let likes = [];

  for (var i = 0; i < 6; i++) {
    likes.push({});

    const renderedLikes = renderLikes(likes);

    t.equals(renderedLikes.length, likes.length);
  }

  t.end();
});

test('PostLikes renders omitted likes number', t => {

  const ommitLikes = 10;

  const ommitedLikes = getRenderedOmmitedLikes([{}], ommitLikes);

  t.equals(ommitedLikes, ommitLikes);

  t.end();
});
