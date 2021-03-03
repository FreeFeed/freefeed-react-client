import {
  DISPLAYNAMES_BOTH,
  DISPLAYNAMES_DISPLAYNAME,
  DISPLAYNAMES_USERNAME,
} from '../utils/frontend-preferences-options';

export function UserDisplayName({
  username,
  screenName = username,
  myUsername = '',
  prefs: { useYou = true, displayOption = DISPLAYNAMES_DISPLAYNAME } = {},
}) {
  if (username === myUsername && useYou) {
    return <span dir="ltr">You</span>;
  }

  if (screenName === username || displayOption === DISPLAYNAMES_USERNAME) {
    return <span dir="ltr">{username}</span>;
  } else if (displayOption === DISPLAYNAMES_BOTH) {
    return (
      <span dir="auto">
        {screenName} <span dir="ltr">({username})</span>
      </span>
    );
  }
  return <span dir="auto">{screenName}</span>;
}
