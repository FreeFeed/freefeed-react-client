import React from 'react';

import cachedFetch from './cached-fetch';
import ScrollSafe from './scroll-helpers/scroll-safe';
import FoldableContent from './scroll-helpers/foldable-content';

const WIKIPEDIA_RE = /^https?:\/\/(\w+)\.wikipedia\.org\/wiki\/([^\/]+)/i;

export function canShowURL(url) {
  return WIKIPEDIA_RE.test(url);
}

const initialState = {
  previewData: null,
};

class WikipediaPreview extends React.Component {
  state = {...initialState};

  async updatePreview(url) {
    const [, lang, term] = WIKIPEDIA_RE.exec(url);
    const data = await cachedFetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${term}`);
    if (data.error) {
      this.setState({previewData: null});
    } else {
      this.setState({previewData: data});
    }
  }

  componentDidMount() {
    this.updatePreview(this.props.url);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.url !== this.props.url) {
      this.setState({...initialState});
      this.updatePreview(newProps.url);
    }
  }

  render() {
    const {url} = this.props;
    const {previewData} = this.state;
    if (!previewData) {
      return null;
    }

    const maxImgWidth = 200, maxImgHeight = 200;
    let imgWidth = 0, imgHeight = 0;
    if (previewData.thumbnail) {
      const {width, height} = previewData.thumbnail;
      const r = Math.min(1, maxImgWidth / width, maxImgHeight / height);
      imgWidth = Math.floor(r * width);
      imgHeight = Math.floor(r * height);
    }

    return (
      <FoldableContent maxUnfoldedHeight={300} foldedHeight={220}>
        <div className="wikipedia-preview link-preview-content">
            <a href={url} target="_blank">
              <div>
                {previewData.thumbnail ? (
                    <img
                      src={previewData.thumbnail.source}
                      alt={previewData.title}
                      className="wikipedia-preview-image"
                      width={imgWidth}
                      height={imgHeight}
                      />
                ) : null}
                <p><strong>{previewData.title}</strong></p>
                <p>{previewData.extract}</p>
              </div>
            </a>
        </div>
      </FoldableContent>
    );
  }
}

export default ScrollSafe(WikipediaPreview, {foldable: false});
