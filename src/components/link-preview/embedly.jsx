import { memo, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { darkTheme } from '../select-utils';
import ScrollSafe from './scroll-helpers/scroll-safe';
import * as heightCache from './scroll-helpers/size-cache';

export default ScrollSafe(
  memo(function EmbedlyPreview({ url }) {
    const box = useRef();
    const feedIsLoading = useSelector((state) => state.routeLoadingState);
    const isDarkTheme = useSelector(darkTheme);

    useEffect(() => {
      initEmbedly();
      box.current.innerHTML = `<a
      href="${url.replace(/"/g, '&quot;')}"
      data-card-controls="0"
      data-card-width="400px"
      data-card-recommend="0"
      data-card-align="left"
      data-card-theme="${isDarkTheme ? 'dark' : 'light'}"
    ></a>`;
      window.embedly('card', box.current.firstChild);
    }, [feedIsLoading, isDarkTheme, url]);

    return (
      <div
        ref={box}
        className="embedly-preview link-preview-content"
        data-url={url}
        style={{ height: `${heightCache.get(url, 0)}px` }}
      />
    );
  }),
);

let embedlyInitialized = false;
function initEmbedly() {
  if (embedlyInitialized) {
    return;
  }
  embedlyInitialized = true;

  const id = 'embedly-platform';
  if (document.querySelector(`#${id}`)) {
    return;
  }
  window.embedly =
    window.embedly || ((...args) => (window.embedly.q = window.embedly.q || []).push(args));
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = `//cdn.embedly.com/widgets/platform.js`;
  const [lastScript] = document.querySelectorAll('script');
  lastScript.parentNode.insertBefore(script, lastScript);

  // Listen for resize events
  window.embedly('on', 'card.resize', (iframe) => {
    const cont = iframe.closest('.embedly-preview');
    if (!cont) {
      return;
    }
    const height = iframe.offsetHeight;
    cont.style.height = `${height}px`;
    heightCache.set(cont.dataset.url, height);
  });
}
