import { Component } from 'react';

import { contentResized } from './scroll-helpers/events';
import ScrollSafe from './scroll-helpers/scroll-safe';

const GOOGLE_DOCS_RE = /^https?:\/\/(?:docs\.google\.com\/(document|spreadsheets|presentation)\/d\/|(drive)\.google\.com\/(?:file\/d\/|open\?id=))([\w-]+)/i;

export function canShowURL(url) {
  return GOOGLE_DOCS_RE.test(url);
}

const defaultAspectRatio = 2.2;
const maxAspectRatio = 1.5;

const initialState = {
  preview: null,
  type: '',
  aspectRatio: defaultAspectRatio,
  isError: false,
};

class GoogleDocsPreview extends Component {
  state = { ...initialState };

  updatePreview(url) {
    const [, t1, t2, id] = GOOGLE_DOCS_RE.exec(url);
    const type = t1 || t2;
    this.setState({ type });
    const img = new Image();
    img.onload = () => this.setState({ preview: img.src, aspectRatio: img.width / img.height });
    img.onerror = () => this.setState({ isError: true });
    const imgWidth = 500 * zoomRate(type);
    img.src = `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      id,
    )}&authuser=0&sz=w${imgWidth}`;
  }

  UNSAFE_componentWillMount() {
    this.updatePreview(this.props.url);
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.url !== this.props.url) {
      this.setState({ ...initialState });
      this.updatePreview(newProps.url);
    }
  }

  componentDidUpdate() {
    contentResized(this);
  }

  render() {
    const { preview, aspectRatio, type, isError } = this.state;

    if (isError) {
      return null;
    }

    return (
      <div className="google-docs-preview link-preview-content">
        <div className={`google-docs-label ${type}`} />
        <a
          className="google-docs-inner"
          href={this.props.url}
          target="_blank"
          style={{
            backgroundSize: `${zoomRate(type) * 100}%`,
            backgroundImage: preview ? `url(${preview})` : null,
            paddingBottom: `${
              100 / (aspectRatio >= maxAspectRatio ? aspectRatio : defaultAspectRatio)
            }%`,
            backgroundPosition: `center ${55 * aspectRatio * (zoomRate(type) - 1)}%`,
          }}
        />
      </div>
    );
  }
}

export default ScrollSafe(GoogleDocsPreview, { trackResize: false, foldable: false });

function zoomRate(type) {
  if (type === 'document') {
    return 1.2;
  }
  if (type === 'spreadsheets') {
    return 1.1;
  }
  return 1;
}
