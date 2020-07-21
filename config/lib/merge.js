export function merge(base, patch) {
  if (!isObject(base) || !isObject(patch)) {
    return patch;
  }

  const result = { ...base };
  for (const key of Object.keys(patch)) {
    result[key] = merge(result[key], patch[key]);
  }

  return result;
}

function isObject(val) {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}
