import { Component } from 'react';
import _ from 'lodash';

import * as aspectRatio from './helpers/size-cache';
import FoldableContent from './helpers/foldable-content';

const INSTAGRAM_RE = /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|tv)\/([\w-]+)/i;

export function canShowURL(url) {
  return INSTAGRAM_RE.test(url);
}

const initialState = { isPrivate: false };

export default class InstagramPreview extends Component {
  iframe = null;
  setIframe = (el) => (this.iframe = el);

  state = { ...initialState };

  onIFrameLoad = () =>
    setTimeout(() => {
      if (this.iframe && !this.iframe.dataset['loaded']) {
        this.setState({ isPrivate: true });
        aspectRatio.set(this.props.url, 0);
      }
    }, 1000);

  componentDidMount() {
    startEventListening();
    // set default frame height
    const r = aspectRatio.get(this.props.url, 470 / 400);
    this.iframe.style.height = `${this.iframe.offsetWidth * r}px`;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      this.setState({ ...initialState });
    }
  }

  render() {
    const [, id] = INSTAGRAM_RE.exec(this.props.url);
    if (this.state.isPrivate) {
      return null;
    }
    return (
      <FoldableContent>
        <div className="instagram-preview link-preview-content">
          <iframe
            ref={this.setIframe}
            src={`https://www.instagram.com/p/${id}/embed/captioned/`}
            data-url={this.props.url}
            onLoad={this.onIFrameLoad}
            frameBorder="0"
            scrolling="no"
            className="instagram-iframe"
          />
        </div>
      </FoldableContent>
    );
  }
}

const startEventListening = _.once(() => window.addEventListener('message', onMessage));

function onMessage(e) {
  if (e.origin !== 'https://www.instagram.com') {
    return;
  }

  let data = null;
  try {
    data = JSON.parse(e.data);
  } catch {
    return;
  }

  if (
    typeof data !== 'object' ||
    typeof data.type !== 'string' ||
    typeof data.details !== 'object'
  ) {
    return;
  }

  const frames = document.querySelectorAll('iframe.instagram-iframe');
  const frame = [...frames].find((fr) => fr.contentWindow === e.source);
  if (frame) {
    if (data.type === 'MEASURE') {
      frame.style.height = `${data.details.height}px`;
      aspectRatio.set(frame.dataset['url'], data.details.height / frame.offsetWidth);
    } else if (data.type === 'LOADING') {
      frame.dataset['loaded'] = '1';
    }
  }
}

export function getEmbedInfo(url) {
  const [, id] = INSTAGRAM_RE.exec(url);

  return {
    byline: '',
    previewURL: `https://instagram.com/p/${id}/media/`,
    playerURL: `https://www.instagram.com/p/${id}/embed/`,
    w: 540,
    h: 540,
    aspectRatio: 1.2,
  };
}
