export const LINK = 'link';
export const AT_LINK = 'atLink';
export const LOCAL_LINK = 'localLink';
export const EMAIL = 'email';

const linkTypes = [LINK, AT_LINK, LOCAL_LINK, EMAIL];

export function isLink({type}) {
  return linkTypes.indexOf(type) !== -1;
}