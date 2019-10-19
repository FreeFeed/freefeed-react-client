export function patchObjectByKey(object, key, patcher) {
  return key in object ? { ...object, [key]: patcher(object[key]) } : object;
}
