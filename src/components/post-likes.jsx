import React from 'react';

import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { preventDefault } from '../utils';
import UserName from './user-name';
import ErrorBoundary from './error-boundary';
import { Icon } from './fontawesome-icons';


const renderLike = (item, i, items) => (
  <li key={item.id} className="post-like">
    {item.id !== 'more-likes' ? (
      <UserName user={item} />
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

export default ({ likes, showMoreLikes, post }) => {
  if (!likes.length) {
    return <div />;
  }

  // Make a copy to prevent props modification
  const likeList = [...likes];

  if (post.omittedLikes) {
    likeList.push({
      id:            'more-likes',
      omittedLikes:  post.omittedLikes,
      showMoreLikes: () => showMoreLikes(post.id)
    });
  }

  const renderedLikes = likeList.map(renderLike);

  return (
    <div className="post-likes">
      <ErrorBoundary>
        <Icon icon={faHeart} className="icon" />
        <ul className="post-likes-list">{renderedLikes}</ul>
      </ErrorBoundary>
    </div>
  );
};
