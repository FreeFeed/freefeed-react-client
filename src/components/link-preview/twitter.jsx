import { encode as qsEncode } from 'querystring';
import { useMemo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { darkTheme } from '../select-utils';
import { withEventListener } from '../hooks/sub-unsub';
import ScrollSafe from './scroll-helpers/scroll-safe';
import * as heightCache from './scroll-helpers/size-cache';

const TWEET_RE = /^https?:\/\/twitter\.com\/[^/]+\/status\/([0-9]+)/i;

export function canShowURL(url) {
  return TWEET_RE.test(url);
}

export default ScrollSafe(function TwitterPreview({ url }) {
  const isDarkTheme = useSelector((state) => darkTheme(state));
  const tweetId = useMemo(() => TWEET_RE.exec(url)?.[1], [url]);
  const embedURL = useMemo(
    () =>
      `https://platform.twitter.com/embed/index.html?${qsEncode({
        dnt: 'true',
        embedId: 'twitter-widget-0',
        id: tweetId,
        theme: isDarkTheme ? 'dark' : 'light',
      })}`,
    [tweetId, isDarkTheme],
  );
  const [height, setHeight] = useState(() => heightCache.get(url, 0));

  useEffect(
    () =>
      withEventListener(window, 'message', ({ origin, data }) => {
        if (
          origin === 'https://platform.twitter.com' &&
          data['twttr.embed']?.method === 'twttr.private.resize'
        ) {
          const twitParams = data['twttr.embed'].params.find((p) => p.data.tweet_id === tweetId);
          if (twitParams) {
            setHeight(twitParams.height);
            heightCache.set(url, twitParams.height);
          }
        }
      }),
    [tweetId, url],
  );

  return (
    <div className="tweet-preview link-preview-content" style={{ height: `${height}px` }}>
      <iframe
        key={embedURL}
        src={embedURL}
        frameBorder="0"
        scrolling="no"
        className="twitter-iframe"
        style={{ height: `${height}px` }}
      />
    </div>
  );
});
