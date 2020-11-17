import { merge } from './merge';

window.CONFIG = window.CONFIG || {};

const scriptRoot = document.currentScript ? document.currentScript.src.replace(/\/[^/]+$/, '') : '';

// Use synchronous request here because the next scripts on page can depend on
// the loaded config. We should rethink the index page logic later.
const req = new XMLHttpRequest();
req.open('GET', `${scriptRoot}/config.json`, false /* Synchronous request! */);
req.setRequestHeader('Cache-Control', 'no-cache');
try {
  req.send();
} catch (e) {
  console.error(e);
  fatalError(`Network error during loading the ${scriptRoot}/config.json.
This is most likely a temporary error.

Please <button onclick="location.reload(true)">reload</button> this page or contact support if the problem persists.
`);
}

if (req.status === 200) {
  try {
    window.CONFIG = merge(window.CONFIG, JSON.parse(req.response));
  } catch (e) {
    console.error(e);
    fatalError(`Error during parsing the ${scriptRoot}/config.json: ${e.message}
The server is probably misconfigured.

Try to <button onclick="location.reload(true)">reload</button> this page or contact support.`);
  }
} else if (req.status !== 404) {
  fatalError(`HTTP error ${req.status} error during loading the ${scriptRoot}/config.json.
The server is probably misconfigured.

Try to <button onclick="location.reload(true)">reload</button> this page or contact support.`);
}

function fatalError(msg) {
  document.write(`<pre>${msg}`);
  window.stop();
}
