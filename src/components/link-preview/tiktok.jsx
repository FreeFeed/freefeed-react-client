import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as Sentry from '@sentry/react';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import * as _ from 'lodash-es';
import { Icon } from '../fontawesome-icons';
import * as aspectRatio from './helpers/size-cache';
import cachedFetch from './helpers/cached-fetch';
import FoldableContent from './helpers/foldable-content';

const TIKTOK_VIDEO_RE = /^https?:\/\/(?:www\.)?tiktok\.com\/@.+?\/video\/(\d+)/i;

export function canShowURL(url) {
  return TIKTOK_VIDEO_RE.test(url);
}

export default function TikTokVideoPreview({ url }) {
  const [isError, setIsError] = useState(false);
  const [oData, setOData] = useState(null);
  const [isStatic, setIsStatic] = useState(true);
  const iframeName = useMemo(() => `__tt_embed__v${Math.round(Math.random() * 10000)}`, []);

  const goDynamic = useCallback(() => {
    startEventListening();
    setIsStatic(false);
  }, []);

  useEffect(() => {
    cachedFetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)
      .then((data) => {
        if ('title' in data) {
          setOData(data);
        } else {
          setIsError(true);
        }

        return true;
      })
      .catch((error) => {
        setIsError(true);

        Sentry.captureException(error, {
          level: 'warning',
          tags: { area: 'link-preview' },
        });
      });
  }, [url]);

  const iframe = useRef();

  useLayoutEffect(() => {
    if (isStatic) {
      return;
    }

    const r = aspectRatio.get(url, 2);
    iframe.current.style.height = `${iframe.current.offsetWidth * r}px`;
  }, [isStatic, url]);

  if (isError) {
    return (
      <div className="link-preview-content">Cannot load TikTok data, probably link is broken.</div>
    );
  }

  if (!oData) {
    return (
      <div className="link-preview-content">
        <div className="tiktok-video-preview">Loading preview data…</div>
      </div>
    );
  }

  const byline = `${oData.title || 'Untitled'} by ${oData.author_name}`;
  const r = aspectRatio.get(url, 2);

  return (
    <FoldableContent>
      <div className="link-preview-content">
        <div className="tiktok-video-preview" aria-label="TikTok preview">
          {isStatic ? (
            <button className="tiktok-static-btn" onClick={goDynamic}>
              <svg viewBox={`0 0 1 ${r}`} />
              <img
                src={oData.thumbnail_url}
                width={oData.thumbnail_width}
                height={oData.thumbnail_height}
                className="tiktok-static-img"
              />
              <Icon icon={faPlayCircle} className="tiktok-static-play-icon" />
            </button>
          ) : (
            <iframe
              ref={iframe}
              name={iframeName}
              src={`https://www.tiktok.com/embed/v2/${
                oData.embed_product_id
              }?referrer=${encodeURIComponent(location.href)}`}
              frameBorder="0"
              sandbox="allow-scripts allow-same-origin allow-popups"
              data-url={url}
              allowFullScreen
              scrolling="no"
              referrerPolicy="no-referrer"
              importance="low"
              loading="lazy"
              className="tiktok-video-iframe"
            />
          )}
        </div>
        {byline && (
          <div className="info">
            <a href={url} target="_blank" title={byline}>
              {byline}
            </a>
          </div>
        )}
      </div>
    </FoldableContent>
  );
}

const startEventListening = _.once(() => window.addEventListener('message', onMessage));

function onMessage(e) {
  if (e.origin !== 'https://www.tiktok.com') {
    return;
  }

  let data = null;
  try {
    data = JSON.parse(e.data);
  } catch {
    return;
  }

  if (typeof data !== 'object' || typeof data.signalSource !== 'string') {
    return;
  }

  const frames = document.querySelectorAll('iframe.tiktok-video-iframe');
  const frame = [...frames].find((fr) => fr.contentWindow === e.source);
  if (frame && typeof data.height === 'number' && data.height > 100) {
    frame.style.height = `${data.height}px`;
    aspectRatio.set(frame.dataset['url'], data.height / frame.offsetWidth);
  }
}
