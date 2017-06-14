import React from 'react';

import {preventDefault} from '../utils';
import UserName from './user-name';

const renderLike = (item, i, items) => (
  <li key={item.id} className="post-like">
    {item.id !== 'more-likes' ? (
      <UserName user={item}/>
    ) : (
      <a className="more-post-likes-link" onClick={preventDefault(item.showMoreLikes)}>{item.omittedLikes} other people</a>
    )}

    {i < items.length - 2 ? (
      ', '
    ) : i === items.length - 2 ? (
      ' and '
    ) : (
      ' liked this '
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
    <div className="post-likes">
      <i className="fa fa-heart icon"></i>
      <ul className="post-likes-list">{renderedLikes}</ul>
    </div>
  );
};
