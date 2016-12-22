const cache = {};

export default async function cachedFetch(url) {
  if (!(url in cache)) {
    const resp = await fetch(url);
    if (!resp.ok) {
      cache[url] = {error: `HTTP error: ${resp.status} ${resp.statusText}`};
    } else {
      cache[url] = await resp.json();
    }
  }
  return cache[url];
}
