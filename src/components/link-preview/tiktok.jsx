import React, { useEffect, useState } from 'react';
import cachedFetch from './cached-fetch';

const TIKTOK_VIDEO_RE = /^https?:\/\/(?:www\.)?tiktok\.com\/@.+?\/video\/(\d+)/i;

export function canShowURL(url) {
  return TIKTOK_VIDEO_RE.test(url);
}

export default function TikTokVideoPreview({ url }) {
  const [, id] = TIKTOK_VIDEO_RE.exec(url);
  const [byline, setByline] = useState(null);

  useEffect(() => {
    cachedFetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`).then((data) => {
      if (data.title) {
        setByline(`${data.title} by ${data.author_name}`);
      }
    });
  }, [url]);

  return (
    <div className="link-preview-content">
      <div className="tiktok-video-preview">
        <iframe
          src={`https://www.tiktok.com/embed/${id}?referrer=https://tiktok.com/`}
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          referrerPolicy="no-referrer"
          importance="low"
          loading="lazy"
          className="tiktok-video-iframe"
        />
      </div>
      {byline && (
        <div className="info">
          <a href={url} target="_blank" title={byline}>
            {byline}
          </a>
        </div>
      )}
    </div>
  );
}
