/**
 * Add query parameters to the location object
 */
export function withQuery({ search, ...rest }) {
  const query = {};
  for (const [key, value] of new URLSearchParams(search)) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return { ...rest, query };
}

/**
 * Convert query object to 'search' string
 */
export function withoutQuery({ query, ...rest }) {
  if (!query) {
    return rest;
  }
  if (Object.keys(query).length === 0) {
    return { ...rest, search: '' };
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        search.append(key, v);
      }
    } else {
      search.set(key, value);
    }
  }
  return { ...rest, search: `?${search.toString()}` };
}
