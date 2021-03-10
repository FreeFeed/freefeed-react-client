import { parse as urlParse } from 'url';
import { parse as queryParse } from 'querystring';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

import { Icon } from '../fontawesome-icons';
import cachedFetch from './cached-fetch';
import * as aspectRatio from './scroll-helpers/size-cache';

const YOUTUBE_VIDEO_RE = /^https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:v=|.+&v=)))([\w-]+)/i;
const VIMEO_VIDEO_RE = /^https:\/\/vimeo\.com\/(\d+)/i;
const COUB_VIDEO_RE = /^https?:\/\/coub\.com\/view\/([a-z\d]+)/i;
const IMGUR_VIDEO_RE = /^https?:\/\/i\.imgur\.com\/([a-z\d]+)\.(gifv|mp4)/i;
const GFYCAT_RE = /^https?:\/\/(?:[a-z]+\.)?gfycat\.com\/(?:[^/]{0,3}\/)?((?:[A-Z][a-z]+){3}|[a-z]{16,})/;
const GIPHY_RE = /^https?:\/\/giphy.com\/gifs\/.+?-([a-zA-Z\d]+)($|\/|\?)/;

const T_YOUTUBE_VIDEO = 'T_YOUTUBE_VIDEO';
const T_VIMEO_VIDEO = 'T_VIMEO_VIDEO';
const T_COUB_VIDEO = 'T_COUB_VIDEO';
const T_IMGUR_VIDEO = 'T_IMGUR_VIDEO';
const T_GFYCAT = 'T_GFYCAT';
const T_GIPHY = 'T_GIPHY';

export function canShowURL(url) {
  return getVideoType(url) !== null;
}

export default memo(function VideoPreview({ url }) {
  const [info, setInfo] = useState(null);
  const [playerVisible, setPlayerVisible] = useState(false);

  const feedIsLoading = useSelector((state) => state.routeLoadingState);

  const [
    // CSS style of video preview
    previewStyle,
    // Video width
    width,
    // Can we show player? (metadata is loaded and we can play video)
    canShowPlayer,
    // Player code
    player,
  ] = useMemo(() => {
    const previewStyle = info ? { backgroundImage: `url(${info.previewURL})` } : {};

    // video will have the same area as 16x9 450px-width rectangle
    const r = info ? info.aspectRatio : aspectRatio.get(url, getDefaultAspectRatio(url));
    const width = 450 * Math.sqrt(9 / 16 / r);
    previewStyle.paddingBottom = `${100 * r}%`;

    const canShowPlayer = info && (info.videoURL || info.playerURL);

    let player = null;
    if (canShowPlayer) {
      if (info.playerURL) {
        player = (
          <iframe
            src={info.playerURL}
            frameBorder="0"
            allowFullScreen={true}
            aria-label="Video player"
          />
        );
      } else {
        player = (
          <video
            src={info.videoURL}
            poster={info.previewURL}
            autoPlay={true}
            loop={true}
            aria-label="Video player"
          />
        );
      }
    }

    return [previewStyle, width, canShowPlayer, player];
  }, [info, url]);

  const showPlayer = useCallback(() => canShowPlayer && setPlayerVisible(true), [canShowPlayer]);

  // Load video info
  useEffect(() => void getVideoInfo(url).then(setInfo), [url]);

  // Turn player off is feed is loading
  useEffect(() => setPlayerVisible(playerVisible && !feedIsLoading), [
    playerVisible,
    feedIsLoading,
  ]);

  if (info && 'error' in info) {
    return <div className="video-preview link-preview-content load-error">{info.error}</div>;
  }

  return (
    <div className="video-preview link-preview-content" style={{ maxWidth: width }}>
      <div
        className="static-preview"
        style={previewStyle}
        onClick={showPlayer}
        aria-label="Video preview"
      >
        {player && (playerVisible ? player : <Icon icon={faPlayCircle} className="play-icon" />)}
      </div>
      <div className="info">
        <a href={url} target="_blank" title={info?.byline}>
          {info ? info.byline : 'Loading…'}
        </a>
      </div>
    </div>
  );
});

// Helpers

export function getVideoType(url) {
  if (YOUTUBE_VIDEO_RE.test(url)) {
    return T_YOUTUBE_VIDEO;
  }
  if (VIMEO_VIDEO_RE.test(url)) {
    return T_VIMEO_VIDEO;
  }
  if (COUB_VIDEO_RE.test(url)) {
    return T_COUB_VIDEO;
  }
  if (IMGUR_VIDEO_RE.test(url)) {
    return T_IMGUR_VIDEO;
  }
  if (GFYCAT_RE.test(url)) {
    return T_GFYCAT;
  }
  if (GIPHY_RE.test(url)) {
    return T_GIPHY;
  }
  return null;
}

function getVideoId(url) {
  let m;
  if ((m = YOUTUBE_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = VIMEO_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = COUB_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = IMGUR_VIDEO_RE.exec(url))) {
    return m[1];
  }
  if ((m = GFYCAT_RE.exec(url))) {
    return m[1];
  }
  if ((m = GIPHY_RE.exec(url))) {
    return m[1];
  }
  return null;
}

function getDefaultAspectRatio(url) {
  if (YOUTUBE_VIDEO_RE.test(url)) {
    return 9 / 16;
  }
  if (VIMEO_VIDEO_RE.test(url)) {
    return 9 / 16;
  }
  if (COUB_VIDEO_RE.test(url)) {
    return 1;
  }
  if (IMGUR_VIDEO_RE.test(url)) {
    return 9 / 16;
  }
  if (GFYCAT_RE.test(url)) {
    return 9 / 16;
  }
  if (GIPHY_RE.test(url)) {
    return 9 / 16;
  }
  return null;
}

export async function getVideoInfo(url, withoutAutoplay) {
  switch (getVideoType(url)) {
    case T_YOUTUBE_VIDEO: {
      const videoID = getVideoId(url);
      return {
        byline: `Open on YouTube`,
        aspectRatio: aspectRatio.set(url, 9 / 16),
        previewURL: `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`,
        playerURL: `https://www.youtube.com/embed/${videoID}?rel=0&fs=1${
          withoutAutoplay ? '' : '&autoplay=1'
        }&start=${youtubeStartTime(url)}`,
      };
    }
    case T_VIMEO_VIDEO: {
      const data = await cachedFetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      );
      if (data.error) {
        return { error: data.error };
      }
      if (!('title' in data)) {
        return { error: data.error ? data.error : 'error loading data' };
      }
      const { hash } = urlParse(url);
      return {
        byline: `${data.title} by ${data.author_name}`,
        aspectRatio: aspectRatio.set(url, data.height / data.width),
        previewURL: data.thumbnail_url.replace(/\d+x\d+/, '450'),
        playerURL: `https://player.vimeo.com/video/${getVideoId(url)}${
          withoutAutoplay ? '' : '?autoplay=1'
        }${hash ? hash : ''}`,
      };
    }
    case T_COUB_VIDEO: {
      const data = await cachedFetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (data.error) {
        return { error: data.error };
      }
      if (!('title' in data)) {
        return { error: data.error ? data.error : 'error loading data' };
      }
      return {
        byline: `${data.title} by ${data.author_name}`,
        aspectRatio: aspectRatio.set(url, data.height / data.width),
        previewURL: data.thumbnail_url,
        playerURL: `https://coub.com/embed/${getVideoId(url)}${
          withoutAutoplay ? '' : '?autostart=true'
        }`,
      };
    }
    case T_IMGUR_VIDEO: {
      const id = getVideoId(url);
      const previewURL = `https://i.imgur.com/${id}h.jpg`;
      try {
        const img = await loadImage(previewURL);
        return {
          byline: 'View at Imgur',
          previewURL,
          aspectRatio: aspectRatio.set(url, img.height / img.width),
          videoURL: `https://i.imgur.com/${id}.mp4`,
        };
      } catch (e) {
        return { error: e.message };
      }
    }
    case T_GFYCAT: {
      const id = getVideoId(url);
      const data = await cachedFetch(`https://api.gfycat.com/v1/gfycats/${encodeURIComponent(id)}`);
      if (!data.gfyItem) {
        return { error: data.message || data.errorMessage || 'invalid gfycat API response' };
      }
      return {
        byline: `${data.gfyItem.title} at Gfycat`,
        previewURL: data.gfyItem.mobilePosterUrl,
        aspectRatio: aspectRatio.set(url, data.gfyItem.height / data.gfyItem.width),
        videoURL: data.gfyItem.mobileUrl,
      };
    }
    case T_GIPHY: {
      const data = await cachedFetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (data.error) {
        return { error: data.error };
      }
      if (!('title' in data)) {
        return { error: data.error ? data.error : 'error loading data' };
      }
      return {
        byline: `${data.title} by ${data.author_name}`,
        aspectRatio: aspectRatio.set(url, data.height / data.width),
        previewURL: data.media_url,
        mediaURL: data.media_url,
        width: data.width,
        height: data.height,
      };
    }
  }
  return { error: 'unknown video type' };
}

/**
 * Extract video start time from YouTube url
 * @param {String} url
 * @return {Number}
 */
function youtubeStartTime(url) {
  const {
    hash,
    query: { t },
  } = urlParse(url, true);
  if (t) {
    return ytSeconds(t);
  }
  if (hash && /t=/.test(hash)) {
    const { t } = queryParse(hash.slice(1));
    if (t) {
      return ytSeconds(t);
    }
  }
  return 0;
}

/**
 * @param {String} x time as number of seconds or in youtube format: #h#m#s
 * @return {Number}
 */
function ytSeconds(x) {
  if (/^\d+$/.test(x)) {
    return parseInt(x);
  }

  const m = /^(?:(?:(\d+)h)?(\d+)m)?(\d+)s$/.exec(x);
  if (m) {
    let t = parseInt(m[3]);
    if (m[2]) {
      t += 60 * parseInt(m[2]);
    }
    if (m[1]) {
      t += 3600 * parseInt(m[1]);
    }
    return t;
  }

  return 0;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Cannot load image'));
    img.src = url;
  });
}
