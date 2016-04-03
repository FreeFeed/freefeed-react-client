import React from 'react';

import UserName from './user-name';
import {preventDefault} from '../utils';

const renderLike = (item, i, items) => (
  <li key={item.id}>
    {item.id !== 'more-likes' ? (
      <UserName user={item}/>
    ) : (
      <a onClick={preventDefault(item.showMoreLikes)}>{item.omittedLikes} other people</a>
    )}

    {i < items.length - 2 ? (
      <span>, </span>
    ) : i === items.length - 2 ? (
      <span> and </span>
    ) : (
      <span> liked this</span>
    )}
  </li>
);

export default ({likes, showMoreLikes, post}) => {
  if (!likes.length) {
    return <div/>;
  }

  const likeList = likes;

  if (post.omittedLikes) {
    likeList.push({
      id: 'more-likes',
      omittedLikes: post.omittedLikes,
      showMoreLikes: () => showMoreLikes(post.id)
    });
  }

  const renderedLikes = likeList.map(renderLike);

  return (
    <div className="likes">
      <i className="fa fa-heart icon"></i>
      <ul>{renderedLikes}</ul>
    </div>
  );
};
