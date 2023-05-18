import base from '../default';
import { merge } from './merge';

window.CONFIG = base;
const scriptRoot = document.currentScript ? document.currentScript.src.replace(/\/[^/]+$/, '') : '';

export async function loadConfig() {
  const resp = await fetch(`${scriptRoot}/config.json`, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (resp.status === 200) {
    try {
      window.CONFIG = merge(window.CONFIG, await resp.json());
    } catch (e) {
      throw new Error(
        `Error during parsing the ${scriptRoot}/config.json: ${e.message}\nThe server is probably misconfigured.`,
      );
    }
  } else if (resp.status === 0) {
    throw new Error(
      `Network error during loading the ${scriptRoot}/config.json.\nPerhaps there is something wrong with your Internet connection.`,
    );
  } else if (resp.status !== 404) {
    // It is ok to not have a config file
    throw new Error(
      `HTTP ${resp.status} error during loading the ${scriptRoot}/config.json.\nThe server is probably misconfigured.`,
    );
  }
}
