import { loadConfig } from '../config/lib/loader-async';

(async () => {
  try {
    if (!window.CUSTOM_CONFIG) {
      const scriptRoot = document.currentScript
        ? document.currentScript.src.replace(/\/[^/]+$/, '')
        : '';
      await loadConfig(`${scriptRoot}/config.json`);
    }

    const { ga, CONFIG } = window;
    if (CONFIG.analytics.google) {
      ga('create', CONFIG.analytics.google, 'auto');
      ga('require', 'eventTracker');
      ga('require', 'outboundLinkTracker');
      ga('require', 'urlChangeTracker');
      ga('send', 'pageview');

      const gaScript = document.createElement('script');
      const [firstScript] = document.querySelectorAll('script');
      gaScript.async = 1;
      gaScript.src = 'https://www.google-analytics.com/analytics.js';
      firstScript.parentNode.insertBefore(gaScript, firstScript);
    }

    // Starting app
    await import('./app');
  } catch (err) {
    const startupBlock = document.querySelector('.startup');
    const startupErrorText = document.querySelector('.startup__error-text');
    startupErrorText.textContent = err.message;
    startupBlock.classList.add('startup--has-error');
  }
})();
