import { merge } from './merge';

window.CONFIG = window.CONFIG || {};

const scriptRoot = document.currentScript ? document.currentScript.src.replace(/\/[^/]+$/, '') : '';

// Use synchronous request here because the next scripts on page can depend on
// the loaded config. We should rethink the index page logic later.
const req = new XMLHttpRequest();
req.open('GET', `${scriptRoot}/config.json`, false /* Synchronous request! */);
req.setRequestHeader('Cache-Control', 'no-cache');
req.send();
if (req.status === 200) {
  try {
    window.CONFIG = merge(window.CONFIG, JSON.parse(req.response));
  } catch (e) {
    // Do nothing if file is not exists or some other error occurred
  }
}
