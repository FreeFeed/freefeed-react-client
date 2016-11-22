import React from 'react';
import _ from 'lodash';

import ScrollSafe from './scroll-helpers/scroll-safe';
import {contentResized} from './scroll-helpers/events';

const INSTAGRAM_RE = /^https?:\/\/(?:www\.)?instagram\.com\/p\/([a-z0-9]+(?:_[a-z0-9]+)?)/i;

export function canShowURL(url) {
  return INSTAGRAM_RE.test(url);
}

class InstagramPreview extends React.Component {
  iframe = null;
  setIframe = el => this.iframe = el;

  componentDidMount() {
    startEventListening();
    // set default frame height
    this.iframe.style.height = (470 / 400 * this.iframe.offsetWidth) + 'px';
  }

  render() {
    const id = INSTAGRAM_RE.exec(this.props.url)[1];
    return (
      <div className="instagram-preview">
        <iframe
          ref={this.setIframe}
          src={`https://www.instagram.com/p/${id}/embed/captioned/`}
          frameBorder="0"
          scrolling="no"
          allowTransparency={true}
          className="instagram-iframe"/>
      </div>
    );
  }
}

export default ScrollSafe(InstagramPreview, {trackResize: false});

const startEventListening = _.once(() => window.addEventListener("message", onMessage));

function onMessage(e) {
  if (e.origin !== 'https://www.instagram.com') {
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
    typeof data.type !== 'string' ||
    typeof data.details !== 'object' ||
    data.type !== 'MEASURE'
  ) {
    return;
  }

  const frames = document.querySelectorAll('iframe.instagram-iframe');
  const frame = [...frames].find(fr => fr.contentWindow === e.source);
  if (frame) {
    frame.style.height = data.details.height + 'px';
    contentResized(frame);
  }
}
