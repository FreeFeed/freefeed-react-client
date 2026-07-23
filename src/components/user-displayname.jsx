import {
  DISPLAYNAMES_BOTH,
  DISPLAYNAMES_DISPLAYNAME,
  DISPLAYNAMES_USERNAME,
} from '../utils/frontend-preferences-options';
import { withIranFlagEmoji } from './iran-flag-emoji';

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
        {withIranFlagEmoji(screenName)} <span dir="ltr">({username})</span>
      </span>
    );
  }
  return <span dir="auto">{withIranFlagEmoji(screenName)}</span>;
}
