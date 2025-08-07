import { parse as parsePattern } from 'regexparam';

export function matchPattern(pattern, path, nest = false) {
  const { keys, pattern: re } = parsePattern(pattern || '*', nest);
  const [matched, ...values] = path.match(re) ?? [null];
  if (matched === null) {
    return null;
  }

  const params = {};
  for (const [i, key] of keys.entries()) {
    params[key.name] = values[i];
  }

  return [params, path.slice(matched.length)];
}
