/* global CONFIG */
export const BOOKMARKLET_POPUP_PATH = 'assets/js/bookmarklet-popup.js';

export function bookmarkletHref() {
  return `javascript:(function() {
    if (window.bookmarklet_popupInit) {
      bookmarklet_popupInit();
      return;
    }
    var s = document.createElement('script');
    s.src = ${JSON.stringify(`${CONFIG.siteOrigin}/${BOOKMARKLET_POPUP_PATH}`)};
    s.type = 'text/javascript';
    s.charset = 'utf-8';
    s.async = true;
    document.head.appendChild(s);
  })()`.replace(/\s+/g, ' ');
}
