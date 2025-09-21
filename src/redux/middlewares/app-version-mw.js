import { setAppVersion } from '../action-creators';

export const appVersionMiddleware = (store) => {
  const { url, header, intervalSec } = globalThis.CONFIG.appVersionCheck;
  async function checkVersion() {
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (res.ok && res.headers.has(header)) {
        store.dispatch(setAppVersion(res.headers.get(header)));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`Cannot fetch '${url}': ${err}`);
    }
  }

  if (url) {
    setInterval(checkVersion, intervalSec * 1000);
  }

  return (next) => (action) => next(action);
};
