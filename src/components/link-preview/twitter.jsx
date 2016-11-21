/* global twttr */
import React from 'react';
import ReactDOM from 'react-dom';
import ScrollSafe from './scroll-helpers/scroll-safe';

const TWEET_RE = /^https?:\/\/twitter\.com\/[^\/]+\/status\/([0-9]+)/i;

export function canShowURL(url) {
  return TWEET_RE.test(url);
}

class TwitterPreview extends React.Component {
  async componentDidMount() {
    await loadTwitterAPI();
    try {
      twttr.widgets.createTweetEmbed(getTweetId(this.props.url), ReactDOM.findDOMNode(this));
    } catch (e) {
      // pass
    }
  }

  render() {
    return <div className="tweet-preview" />;
  }
}

export default ScrollSafe(TwitterPreview);

// Helpers

function getTweetId(url) {
  const m = TWEET_RE.exec(url);
  return m ? m[1] : null;
}

const API_SRC = 'https://platform.twitter.com/widgets.js';
let _apiLoaded;
function loadTwitterAPI() {
  if (!_apiLoaded) {
    _apiLoaded = new Promise((resolve) => {
      const s = document.createElement('script');
      s.setAttribute('src', API_SRC);
      s.addEventListener('load', () => resolve());
      document.head.appendChild(s);
    });
  }
  return _apiLoaded;
}
