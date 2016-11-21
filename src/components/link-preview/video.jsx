import {parse as urlParse} from 'url';
import {parse as queryParse} from 'querystring';
import React from 'react';

import ScrollSafe from './scroll-helpers/scroll-safe';
import {contentResized} from './scroll-helpers/events';
import cachedFetch from './cached-fetch';

const YOUTUBE_VIDEO_RE = /^https?:\/\/(?:www\.|m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:v=|.+&v=)))([a-z0-9_-]+)/i;
const VIMEO_VIDEO_RE = /^https:\/\/vimeo\.com\/([0-9]+)/i;
const COUB_VIDEO_RE = /^https?:\/\/coub\.com\/view\/([a-z0-9]+)/i;

const T_YOUTUBE_VIDEO = 'T_YOUTUBE_VIDEO';
const T_VIMEO_VIDEO = 'T_VIMEO_VIDEO';
const T_COUB_VIDEO = 'T_COUB_VIDEO';

export function canShowURL(url) {
  return getVideoType(url) !== null;
}

class VideoPreview extends React.Component {
  static propTypes = {
    url: React.PropTypes.string.isRequired,
  };

  state = {
    info: null,
    player: false,
  };

  loadPlayer = () => this.setState({player: true});

  loadInfo = async () => this.setState({info: await getVideoInfo(this.props.url)});

  constructor(props) {
    super(props);
    this.loadInfo();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.setState({
        info: null,
        player: false,
      });
      setTimeout(this.loadInfo, 0);
    }
  }

  componentDidUpdate() {
    contentResized(this);
  }

  render() {
    const {url} = this.props;
    const {player, info} = this.state;

    if (info && ('error' in info)) {
      return <div className="video-preview load-error">{info.error}</div>;
    }

    const previewStyle = info ? {
      backgroundImage: `url(${info.previewURL})`,
      paddingBottom: 100/info.aspectRatio + '%',
    } : {};

    // video will have the same area as 16x9 450px-width rectangle
    const width = 450 * Math.sqrt((info ? info.aspectRatio : getDefaultAspectRatio(url)) / (16/9));

    return (
      <div className="video-preview" style={{maxWidth: width}}>
        <div className="static-preview" style={previewStyle} onClick={this.loadPlayer}>
          {player ? (
            <iframe src={info.playerURL} frameBorder="0" allowFullScreen={true} />
          ) : (
            <i className="fa fa-play-circle play-icon" />
          )}
        </div>
        <div className="info">
          <a href={url} target="_blank" title={info ? info.byline : false}>{info ? info.byline : 'Loading…'}</a>
        </div>
      </div>
    );
  }
}

export default ScrollSafe(VideoPreview, {foldable: false, trackResize: false});

// Helpers

function getVideoType(url) {
  if (YOUTUBE_VIDEO_RE.test(url)) { return T_YOUTUBE_VIDEO; }
  if (VIMEO_VIDEO_RE.test(url)) { return T_VIMEO_VIDEO; }
  if (COUB_VIDEO_RE.test(url)) { return T_COUB_VIDEO; }
  return null;
}

function getVideoId(url) {
  let m;
  if ((m = YOUTUBE_VIDEO_RE.exec(url))) { return m[1]; }
  if ((m = VIMEO_VIDEO_RE.exec(url))) { return m[1]; }
  if ((m = COUB_VIDEO_RE.exec(url))) { return m[1]; }
  return null;
}

function getDefaultAspectRatio(url) {
  if (YOUTUBE_VIDEO_RE.test(url)) { return 16/9; }
  if (VIMEO_VIDEO_RE.test(url)) { return 16/9; }
  if (COUB_VIDEO_RE.test(url)) { return 1; }
  return null;
}

async function getVideoInfo(url) {
  switch (getVideoType(url)) {
    case T_YOUTUBE_VIDEO: {
      const data = await cachedFetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (data.error) {
        return {error: data.error};
      }
      if (!('title' in data)) {
        return {error: data.error ? data.error : 'error loading data'};
      }
      return {
        byline: `${data.title} by ${data.author_name}`,
        aspectRatio: data.width / data.height,
        previewURL: data.thumbnail_url,
        playerURL: `https://www.youtube.com/embed/${getVideoId(url)}?rel=0&fs=1&autoplay=1&start=${youtubeStartTime(url)}`,
      };
    }
    case T_VIMEO_VIDEO: {
      const data = await cachedFetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (data.error) {
        return {error: data.error};
      }
      if (!('title' in data)) {
        return {error: data.error ? data.error : 'error loading data'};
      }
      const {hash} = urlParse(url);
      return {
        byline: `${data.title} by ${data.author_name}`,
        aspectRatio: data.width / data.height,
        previewURL: data.thumbnail_url.replace(/[0-9]+x[0-9]+/, '450'),
        playerURL: `https://player.vimeo.com/video/${getVideoId(url)}?autoplay=1${hash ? hash : ''}`,
      };
    }
    case T_COUB_VIDEO: {
      const data = await cachedFetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      if (data.error) {
        return {error: data.error};
      }
      if (!('title' in data)) {
        return {error: data.error ? data.error : 'error loading data'};
      }
      return {
        byline: `${data.title} by ${data.author_name}`,
        aspectRatio: data.width / data.height,
        previewURL: data.thumbnail_url,
        playerURL: `https://coub.com/embed/${getVideoId(url)}?autostart=true`,
      };
    }
  }
  return {error: 'unknown video type'};
}

/**
 * Extract video start time from YouTube url
 * @param {String} url
 * @return {Number}
 */
function youtubeStartTime(url) {
  const {hash, query: {t}} = urlParse(url, true);
  if (t) {
    return ytSeconds(t);
  }
  if (hash && /t=/.test(hash)) {
    const {t} = queryParse(hash.substring(1));
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
  if (/^[0-9]+$/.test(x)) {
    return parseInt(x);
  }

  const m = /^(?:(?:([0-9]+)h)?([0-9]+)m)?(?:([0-9]+)s)$/;
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
