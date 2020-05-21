import React from 'react';
import { Link } from 'react-router';

export function HomeFeedLink({ feed }) {
  return <Link to={homeFeedURI(feed)}>{feed.title}</Link>;
}

export function homeFeedURI(feed) {
  return feed.isInherent
    ? '/'
    : `/list/${feed.id.substring(0, 4)}/${encodeURIComponent(feed.title)}`;
}
