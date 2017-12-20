import React from 'react';
import { once } from 'lodash';

import ScrollSafe from './scroll-helpers/scroll-safe';
import * as heightCache from './scroll-helpers/size-cache';

const TG_POST_RE = /^https:\/\/t\.me\/[a-z][a-z0-9_]+\/([0-9]+)/;

export function canShowURL(url) {
  return TG_POST_RE.test(url);
}

class TelegramPreview extends React.Component {
  static propTypes = {
    url: React.PropTypes.string.isRequired,
  };

  componentDidMount() {
    startEventListening();
  }

  render() {
    const { url } = this.props;
    const [baseURL] = url.match(TG_POST_RE);
    return (
      <div className="telegram-preview link-preview-content">
        <iframe
          src={`${baseURL}?embed=1`}
          data-url={baseURL}
          frameBorder="0"
          scrolling="no"
          allowTransparency={true}
          className="telegram-iframe"
          style={{ height: heightCache.get(baseURL, 0) }}
        />
      </div>
    );
  }
}

export default ScrollSafe(TelegramPreview);

const startEventListening = once(() => window.addEventListener("message", onMessage));

function onMessage(e) {
  if (e.origin !== 'https://t.me') {
    return;
  }

  let data = null;
  try {
    data = JSON.parse(e.data);
  } catch (e) {
    return;
  }

  if (
    typeof data !== 'object' ||
    typeof data.event !== 'string'
  ) {
    return;
  }

  const frames = document.querySelectorAll('iframe.telegram-iframe');
  const frame = [...frames].find((fr) => fr.contentWindow === e.source);

  if (frame) {
    if (data.event === 'resize') {
      frame.style.height = `${data.height}px`;
      heightCache.set(frame.dataset['url'], data.height);
    }
  }
}
