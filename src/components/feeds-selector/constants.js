// Strong requirements: post cannot change it's type during editing
export const EDIT_DIRECT = 'PREFER_DIRECT';
export const EDIT_REGULAR = 'PREFER_REGULAR';
// Weak requirements: post can change it's type before creation
export const CREATE_DIRECT = 'DIRECT';
export const CREATE_REGULAR = 'REGULAR';

export function isEditing(mode) {
  return mode === EDIT_DIRECT || mode === EDIT_REGULAR;
}

export const MY_FEED_LABEL = 'My feed';

export const ACC_ME = 'me';
export const ACC_GROUP = 'group';
export const ACC_USER = 'user';
export const ACC_BAD_GROUP = 'bad group';
export const ACC_BAD_USER = 'bad user';
export const ACC_UNKNOWN = 'loading';
export const ACC_NOT_FOUND = 'not found';
