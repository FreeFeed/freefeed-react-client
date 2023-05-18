/* global CONFIG */
import { loadConfig } from '../config/lib/loader-async';
import { initApp } from './app';

(async () => {
  try {
    await loadConfig();
  } catch (err) {
    const startupBlock = document.querySelector('.startup');
    const startupErrorText = document.querySelector('.startup__error-text');
    startupErrorText.textContent = err.message;
    startupBlock.classList.add('startup--has-error');
    return;
  }

  if (CONFIG.analytics.google) {
    /* eslint-disable */
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', CONFIG.analytics.google, 'auto');
    ga('require', 'eventTracker');
    ga('require', 'outboundLinkTracker');
    ga('require', 'urlChangeTracker');
    ga('send', 'pageview');
    /* eslint-enable */
  }

  initApp();
})();
