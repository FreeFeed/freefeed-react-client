import { faGlobeAmericas, faLock, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import {
  DISPLAYNAMES_BOTH,
  DISPLAYNAMES_DISPLAYNAME,
  DISPLAYNAMES_USERNAME,
} from '../utils/frontend-preferences-options';
import { Icon } from './fontawesome-icons';

export function UserDisplayName({
  username,
  screenName = username,
  myUsername = '',
  isPrivate,
  isProtected,
  siteTitle,
  prefs: { useYou = true, displayOption = DISPLAYNAMES_DISPLAYNAME } = {},
}) {
  if (username === myUsername && useYou) {
    return (
      <div className="display-name">
        <div dir="ltr">You</div>
        <div className="post-footer-icon">
          {isPrivate ? (
            <Icon
              icon={faLock}
              className="post-lock-icon post-private-icon"
              title="This entry is private"
              role="button"
            />
          ) : isProtected ? (
            <Icon
              icon={faUserFriends}
              className="post-lock-icon post-protected-icon"
              title={`This entry is only visible to ${siteTitle} users`}
              role="button"
            />
          ) : (
            <Icon
              icon={faGlobeAmericas}
              className="post-lock-icon post-public-icon"
              title="This entry is public"
              role="button"
            />
          )}
        </div>
      </div>
    );
  }

  if (screenName === username || displayOption === DISPLAYNAMES_USERNAME) {
    return (
      <div className="display-name">
        <div dir="ltr">{username}</div>
        <div className="post-footer-icon">
          {isPrivate ? (
            <Icon
              icon={faLock}
              className="post-lock-icon post-private-icon"
              title="This entry is private"
              role="button"
            />
          ) : isProtected ? (
            <Icon
              icon={faUserFriends}
              className="post-lock-icon post-protected-icon"
              title={`This entry is only visible to ${siteTitle} users`}
              role="button"
            />
          ) : (
            <Icon
              icon={faGlobeAmericas}
              className="post-lock-icon post-public-icon"
              title="This entry is public"
              role="button"
            />
          )}
        </div>
      </div>
    );
  } else if (displayOption === DISPLAYNAMES_BOTH) {
    return (
      <div className="display-name">
        <div dir="ltr">
          {screenName} <div dir="ltr">({username})</div>
        </div>
        <div className="post-footer-icon">
          {isPrivate ? (
            <Icon
              icon={faLock}
              className="post-lock-icon post-private-icon"
              title="This entry is private"
              role="button"
            />
          ) : isProtected ? (
            <Icon
              icon={faUserFriends}
              className="post-lock-icon post-protected-icon"
              title={`This entry is only visible to ${siteTitle} users`}
              role="button"
            />
          ) : (
            <Icon
              icon={faGlobeAmericas}
              className="post-lock-icon post-public-icon"
              title="This entry is public"
              role="button"
            />
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="display-name">
      <div dir="ltr">{screenName}</div>
      <div className="post-footer-icon">
        {isPrivate ? (
          <Icon
            icon={faLock}
            className="post-lock-icon post-private-icon"
            title="This entry is private"
            role="button"
          />
        ) : isProtected ? (
          <Icon
            icon={faUserFriends}
            className="post-lock-icon post-protected-icon"
            title={`This entry is only visible to ${siteTitle} users`}
            role="button"
          />
        ) : (
          <Icon
            icon={faGlobeAmericas}
            className="post-lock-icon post-public-icon"
            title="This entry is public"
            role="button"
          />
        )}
      </div>
    </div>
  );
}
