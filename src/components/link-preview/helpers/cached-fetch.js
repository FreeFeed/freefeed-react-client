const cache = new Map();

export default async function cachedFetch(url) {
  if (!cache.has(url)) {
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) {
      cache.set(url, {
        error: `HTTP error: ${resp.status} ${resp.statusText}`,
        httpStatus: resp.status,
      });
    } else {
      cache.set(url, await resp.json());
    }
  }
  return cache.get(url);
}
