import { merge } from './merge';

export async function loadConfig(path) {
  const resp = await fetch(path, {
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (resp.status === 200) {
    try {
      window.CONFIG = merge(window.CONFIG, await resp.json());
    } catch (e) {
      throw new Error(
        `Error during parsing the ${path}: ${e.message}\nThe server is probably misconfigured.`,
      );
    }
  } else if (resp.status === 0) {
    throw new Error(
      `Network error during loading the ${path}.\nPerhaps there is something wrong with your Internet connection.`,
    );
  } else if (resp.status !== 404) {
    // It is ok to not have a config file
    throw new Error(
      `HTTP ${resp.status} error during loading the ${path}.\nThe server is probably misconfigured.`,
    );
  }
}
