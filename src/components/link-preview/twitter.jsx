/* global twttr */
import React from 'react';
import { connect } from 'react-redux';

import { darkTheme } from '../select-utils';
import ScrollSafe from './scroll-helpers/scroll-safe';
import * as heightCache from './scroll-helpers/size-cache';


const TWEET_RE = /^https?:\/\/twitter\.com\/[^/]+\/status\/([0-9]+)/i;

export function canShowURL(url) {
  return TWEET_RE.test(url);
}

class TwitterPreview extends React.PureComponent {
  elem = React.createRef();

  async embed() {
    await loadTwitterAPI();
    try {
      this.elem.current.innerHTML = '';
      await twttr.widgets.createTweet(
        getTweetId(this.props.url),
        this.elem.current,
        {
          theme: this.props.darkTheme ? 'dark' : 'light',
          dnt:   true,
        }
      );
    } catch (e) {
      // pass
    }
  }


  componentDidMount() {
    this.embed();
  }

  componentDidUpdate() {
    setTimeout(() => this.embed(), 0);
  }

  render() {
    return (
      <div
        key={`${this.props.url}##${this.props.darkTheme ? 'dark' : 'light'}`}
        className="tweet-preview link-preview-content"
        data-url={this.props.url}
        style={{ height: `${heightCache.get(this.props.url, 0)}px` }}
      >
        <div ref={this.elem} style={{ overflow: 'hidden' }} />
      </div>
    );
  }
}

function select(state) {
  return { darkTheme: darkTheme(state) };
}

export default ScrollSafe(connect(select)(TwitterPreview));

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
        cont.style.height = `${height}px`;
        heightCache.set(cont.dataset.url, height);
      });
    });
  }
  return _apiLoaded;
}
