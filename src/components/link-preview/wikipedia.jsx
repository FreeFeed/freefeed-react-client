import React from 'react';

import cachedFetch from './cached-fetch';
import ScrollSafe from './scroll-helpers/scroll-safe';
import FoldableContent from './scroll-helpers/foldable-content';
import * as heightCache from './scroll-helpers/size-cache';

const WIKIPEDIA_RE = /^https?:\/\/(\w+)\.wikipedia\.org\/wiki\/([^/]+)/i;

export function canShowURL(url) {
  return WIKIPEDIA_RE.test(url);
}

const initialState = {
  previewData: null,
  isError: false,
};

class WikipediaPreview extends React.Component {
  state = {...initialState};

  element = null;
  setElement = (el) => this.element = el;

  async updatePreview(url) {
    const [, lang, term] = WIKIPEDIA_RE.exec(url);
    const data = await cachedFetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${term}`);
    if (data.error) {
      this.setState({previewData: null, isError: true});
    } else {
      this.setState({previewData: data, isError: false});
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

  componentDidUpdate() {
    if (this.element && this.state.previewData) {
      heightCache.set(this.props.url, this.element.offsetHeight);
    }
  }


  render() {
    const {url} = this.props;
    const {previewData, isError} = this.state;
    const cachedHeight = heightCache.get(this.props.url, 0);

    if (isError || !previewData && cachedHeight === 0) {
      return null;
    }

    const maxImgWidth = 200, maxImgHeight = 180;
    let imgWidth = 0, imgHeight = 0;
    if (previewData && previewData.thumbnail) {
      const {width, height} = previewData.thumbnail;
      const r = Math.min(1, maxImgWidth / width, maxImgHeight / height);
      imgWidth = Math.floor(r * width);
      imgHeight = Math.floor(r * height);
    }

    return (
      <div className="link-preview-content">
        <FoldableContent maxUnfoldedHeight={250} foldedHeight={200}>
          {previewData ? (
            <div
              ref={this.setElement}
              className="wikipedia-preview"
            >
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
          ) : (
            <div
              className="wikipedia-preview"
              style={{height: `${heightCache.get(this.props.url, 0)}px`}}
            >
              Loading…
            </div>
          )}
        </FoldableContent>
      </div>
    );
  }
}

export default ScrollSafe(WikipediaPreview, {foldable: false});
