/* global twttr */
import React from 'react';
import ReactDOM from 'react-dom';

import ScrollSafe from './scroll-helpers/scroll-safe';
import * as heightCache from './scroll-helpers/size-cache';

const TWEET_RE = /^https?:\/\/twitter\.com\/[^/]+\/status\/([0-9]+)/i;

export function canShowURL(url) {
  return TWEET_RE.test(url);
}

class TwitterPreview extends React.Component {
  async componentDidMount() {
    await loadTwitterAPI();
    try {
      twttr.widgets.createTweetEmbed(getTweetId(this.props.url), ReactDOM.findDOMNode(this).firstChild);
    } catch (e) {
      // pass
    }
  }

  render() {
    return (
      <div
        className="tweet-preview link-preview-content"
        data-url={this.props.url}
        style={{height: heightCache.get(this.props.url, 0) + 'px'}}
      >
        <div style={{overflow: 'hidden'}} />
      </div>
    );
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
    }).then(() => {
      twttr.events.bind('rendered', (e) => {
        const height = e.target.parentNode.offsetHeight;
        const cont = e.target.parentNode.parentNode;
        cont.style.height = height + 'px';
        heightCache.set(cont.dataset.url, height);
      });
    });
  }
  return _apiLoaded;
}
