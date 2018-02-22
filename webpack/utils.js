export function strToBool(val, def) {
  if (val === undefined) {
    return def;
  }

  val = val.toLowerCase();
  return val === '1' || val === 'true' || val === 'yes' || val === 'y';
}

export function skipFalsy(array) {
  return array.filter((item) => !!item);
}
