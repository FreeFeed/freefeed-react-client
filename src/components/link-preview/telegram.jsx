import { useEffect } from 'react';
import { once } from 'lodash';

import * as heightCache from './helpers/size-cache';
import FoldableContent from './helpers/foldable-content';

const TG_POST_RE = /^https:\/\/t\.me\/[a-zA-Z]\w+\/(\d+)/;

export function canShowURL(url) {
  return TG_POST_RE.test(url);
}

export default function TelegramPreview({ url }) {
  useEffect(() => void startEventListening(), []);
  const [baseURL] = url.match(TG_POST_RE);

  return (
    <FoldableContent>
      <div className="telegram-preview link-preview-content">
        <iframe
          src={`${baseURL}?embed=1`}
          data-url={baseURL}
          frameBorder="0"
          scrolling="no"
          className="telegram-iframe"
          style={{ height: heightCache.get(baseURL, 0) }}
        />
      </div>
    </FoldableContent>
  );
}

const startEventListening = once(() => window.addEventListener('message', onMessage));

function onMessage(e) {
  if (e.origin !== 'https://t.me') {
    return;
  }

  let data = null;
  try {
    data = JSON.parse(e.data);
  } catch {
    return;
  }

  if (typeof data !== 'object' || typeof data.event !== 'string') {
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
