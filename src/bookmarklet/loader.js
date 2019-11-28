/* global CONFIG */
export function bookmarkletHref() {
  return `javascript:(function() {
    if (window.bookmarklet_popupInit) {
      bookmarklet_popupInit();
      return;
    }
    var s = document.createElement('script');
    s.src = ${JSON.stringify(`${CONFIG.siteOrigin}/assets/js/bookmarklet-popup.js`)};
    s.type = 'text/javascript';
    s.charset = 'utf-8';
    s.async = true;
    document.head.appendChild(s);
  })()`.replace(/\s+/g, ' ');
}
