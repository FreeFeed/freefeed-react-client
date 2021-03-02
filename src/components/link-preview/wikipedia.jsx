import { memo, useState, useEffect, useMemo, useRef } from 'react';

import cachedFetch from './cached-fetch';
import FoldableContent from './scroll-helpers/foldable-content';
import * as heightCache from './scroll-helpers/size-cache';

const WIKIPEDIA_RE = /^https?:\/\/(\w+)\.(?:m\.)?wikipedia\.org\/wiki\/([^/]+)/i;

export function canShowURL(url) {
  return WIKIPEDIA_RE.test(url);
}

export default memo(function WikipediaPreview({ url }) {
  const [{ previewData, isError }, setState] = useState({
    previewData: null,
    isError: false,
  });

  const previewEl = useRef(null);

  useEffect(() => {
    if (previewEl.current && previewData) {
      heightCache.set(url, previewEl.offsetHeight);
    }
  }, [previewData, url]);

  useEffect(
    () =>
      void (async () => {
        setState({ previewData: null, isError: false });
        const [, lang, term] = WIKIPEDIA_RE.exec(url);
        const data = await cachedFetch(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${term}`,
        );
        if (data.error) {
          setState({ previewData: null, isError: true });
        } else {
          setState({ previewData: data, isError: false });
        }
      })(),
    [url],
  );

  const cachedHeight = useMemo(() => heightCache.get(url, 0), [url]);

  if (isError || (!previewData && cachedHeight === 0)) {
    return null;
  }

  const maxImgWidth = 200,
    maxImgHeight = 180;
  let imgWidth = 0,
    imgHeight = 0;
  if (previewData && previewData.thumbnail) {
    const { width, height } = previewData.thumbnail;
    const r = Math.min(1, maxImgWidth / width, maxImgHeight / height);
    imgWidth = Math.floor(r * width);
    imgHeight = Math.floor(r * height);
  }

  return (
    <div className="link-preview-content">
      <FoldableContent maxUnfoldedHeight={250} foldedHeight={200}>
        {previewData ? (
          <div ref={previewEl} className="wikipedia-preview">
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
                <p>
                  <strong>{previewData.title}</strong>
                </p>
                <p>{previewData.extract}</p>
              </div>
            </a>
          </div>
        ) : (
          <div className="wikipedia-preview" style={{ height: `${cachedHeight}px` }}>
            Loading…
          </div>
        )}
      </FoldableContent>
    </div>
  );
});
