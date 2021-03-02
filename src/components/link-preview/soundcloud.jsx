import { useEffect, useState } from 'react';
import cachedFetch from './cached-fetch';

const SOUNDCLOUD_SONG_RE = /^https:\/\/soundcloud\.com\/([^/]+)\/([^/]+)$/;
const SOUNDCLOUD_AUTHOR_RE = /^https:\/\/soundcloud\.com\/([^/]+)$/;

const SOUNDCLOUD_TRACK_RE = /api\.soundcloud\.com%2Ftracks%2F(\d+)/;
const SOUNDCLOUD_USER_RE = /api\.soundcloud\.com%2Fusers%2F(\d+)/;

export function canShowURL(url) {
  return SOUNDCLOUD_SONG_RE.test(url) || SOUNDCLOUD_AUTHOR_RE.test(url);
}

export default function SoundCloudPreview({ url }) {
  const [playerUrl, setPlayerUrl] = useState(null);
  const [byline, setByline] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    cachedFetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`).then(
      (data) => {
        if (!data.title || !data.html) {
          setIsError(true);
        }

        setByline(data.title);
        if (SOUNDCLOUD_TRACK_RE.test(data.html)) {
          const [, id] = SOUNDCLOUD_TRACK_RE.exec(data.html);
          setPlayerUrl(`https://api.soundcloud.com/tracks/${id}`);
        } else if (SOUNDCLOUD_USER_RE.test(data.html)) {
          const [, id] = SOUNDCLOUD_USER_RE.exec(data.html);
          setPlayerUrl(`https://api.soundcloud.com/users/${id}`);
        }
      },
    );
  }, [url]);

  if (!playerUrl && !isError) {
    return <p>Loading...</p>;
  }

  if (isError) {
    return null;
  }

  return (
    <div className="soundcloud-preview link-preview-content">
      <iframe
        src={`${
          'https://w.soundcloud.com/player/?' +
          'auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&buying=false' +
          '&url='
        }${encodeURIComponent(playerUrl)}`}
        frameBorder="0"
        scrolling="no"
        className="soundcloud-iframe"
        style={{ width: '100%', maxWidth: '450px', height: '166px' }}
      />
      <div className="info">
        <a href={url} target="_blank" title={byline}>
          {byline} at SoundCloud
        </a>
      </div>
    </div>
  );
}
