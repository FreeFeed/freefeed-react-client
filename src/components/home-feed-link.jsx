import React from 'react';
import { Link } from 'react-router';

export function HomeFeedLink({ feed }) {
  const link = feed.isInherent
    ? '/'
    : `/list/${feed.id.substring(0, 4)}/${encodeURIComponent(feed.title)}`;
  return <Link to={link}>{feed.title}</Link>;
}
