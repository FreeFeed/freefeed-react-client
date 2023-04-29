export function getPrivacy({ isPrivate, isProtected }) {
  if (isProtected === '0') {
    return 'public';
  }
  if (isPrivate === '0') {
    return 'protected';
  }
  return 'private';
}
