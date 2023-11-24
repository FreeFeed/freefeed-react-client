/* global CONFIG */
import {
  faGlobeAmericas,
  faHome,
  faLock,
  faQuestion,
  faSpinner,
  faUser,
  faUserFriends,
  faUserSlash,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';
import { uniq, uniqBy } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { Icon } from '../fontawesome-icons';

// Local styles
import { getUserInfo } from '../../redux/action-creators';
import { getPrivacy } from '../../utils/get-privacy';
import styles from './selector.module.scss';
import {
  ACC_ME,
  ACC_GROUP,
  ACC_USER,
  ACC_BAD_GROUP,
  ACC_BAD_USER,
  ACC_UNKNOWN,
  ACC_NOT_FOUND,
  MY_FEED_LABEL,
} from './constants';

const typeIcon = {
  [ACC_ME]: faHome,
  //  [ACC_GROUP]: faUsers,
  //  [ACC_BAD_GROUP]: faUsersSlash,
  [ACC_USER]: faUser,
  [ACC_BAD_USER]: faUserSlash,
  [ACC_UNKNOWN]: faSpinner,
  [ACC_NOT_FOUND]: faQuestion,
};

const privacyIcon = {
  public: faGlobeAmericas,
  protected: faUserFriends,
  private: faLock,
  user: faUser,
};

const typeOrder = {
  [ACC_ME]: 1,
  [ACC_GROUP]: 2,
  [ACC_USER]: 3,
  [ACC_BAD_GROUP]: 4,
  [ACC_BAD_USER]: 5,
  [ACC_UNKNOWN]: 6,
  [ACC_NOT_FOUND]: 7,
};

export function DisplayOption({ option, context, className }) {
  return (
    <span
      className={cn(className, styles[`option`], styles[`option-ctx--${context}`])}
      title={`@${option.value}`}
    >
      <span>
        {option.type === ACC_ME || option.type === ACC_GROUP ? (
          <Icon className={styles['dest-icon']} icon={privacyIcon[option.privacy]} />
        ) : (
          typeIcon[option.type] && (
            <Icon className={styles['dest-icon']} icon={typeIcon[option.type]} />
          )
        )}
        {option.type === ACC_ME ? (
          MY_FEED_LABEL
        ) : (
          <>
            {option.value}
            {context === 'menu' && option.label !== option.value && (
              <span className={styles['dest-screenName']}>{option.label}</span>
            )}
          </>
        )}
      </span>
      {context === 'menu' && (
        <a href={`/${option.value}`} target="_blank" className={styles[`option__link`]}>
          <Icon className={styles['dest-icon']} icon={faExternalLinkAlt} />
        </a>
      )}
    </span>
  );
}

/**
 * @param {string[]} usernames
 * @param {string[]} fixedFeedNames
 */
export function useSelectedOptions(usernames, fixedFeedNames) {
  const dispatch = useDispatch();
  const userInfoStatuses = useSelector((store) => store.getUserInfoStatuses);

  usernames = useMemo(() => usernames.map((u) => u.toLowerCase()), [usernames]);

  const me = useSelector((store) => store.user);
  const mySubscriptions = useSelector(
    (store) => store.user.subscriptions.map((id) => store.users[id]),
    shallowEqual,
  );

  const notFoundUsers = useSelector(
    (store) => usernames.filter((name) => store.usersNotFound.includes(name)),
    shallowEqual,
  );

  const userObjects = useSelector(
    (store) => Object.values(store.users).filter((u) => usernames.includes(u.username)),
    shallowEqual,
  );

  const groupOptions = useMemo(
    () =>
      uniqBy(
        [
          ...privacyControlOptions(),
          ...mySubscriptions
            .filter((u) => u?.type === 'group' && u.youCan.includes('post'))
            .map((u) => toOption(u, me)),
        ],
        'value',
      ).sort(compareOptions),
    [me, mySubscriptions],
  );

  const userOptions = useMemo(
    () =>
      mySubscriptions
        .filter((u) => u?.type === 'user' && u.youCan.includes('dm'))
        .map((u) => toOption(u, me))
        .sort(compareOptions),
    [me, mySubscriptions],
  );

  const usersByName = useMemo(
    () => new Map(userObjects.map((u) => [u.username, u])),
    [userObjects],
  );

  const values = useMemo(
    () =>
      uniq(usernames)
        .map((name) => {
          const props = {
            label: name,
            value: name,
            type: ACC_UNKNOWN,
            privacy: 'user',
            isFixed: fixedFeedNames.includes(name),
          };

          if (name === me.username) {
            // It's me!
            return { ...props, label: MY_FEED_LABEL, type: ACC_ME, privacy: getPrivacy(me) };
          }

          const acc = usersByName.get(name);
          if (acc?.type === 'group') {
            return {
              ...props,
              label: acc.screenName,
              type: acc.youCan.includes('post') ? ACC_GROUP : ACC_BAD_GROUP,
              privacy: getPrivacy(acc),
            };
          } else if (acc?.type === 'user') {
            return {
              ...props,
              type: acc.youCan.includes('dm') ? ACC_USER : ACC_BAD_USER,
            };
          } else if (!acc && notFoundUsers.includes(name)) {
            // Account not found
            return { ...props, type: ACC_NOT_FOUND };
          }

          // We are here, so we don't know anything about this account. We need to
          // request user's info.
          return props;
        })
        .sort(compareOptions),
    [usernames, fixedFeedNames, me, usersByName, notFoundUsers],
  );

  // Load missing accounts
  useEffect(() => {
    values
      .filter((v) => v.type === ACC_UNKNOWN)
      .map((v) => v.value)
      .filter((username) => !userInfoStatuses[username])
      .forEach((username) => dispatch(getUserInfo(username)));
  }, [dispatch, userInfoStatuses, values]);

  const meOption = useMemo(() => toOption(me, me), [me]);

  return { values, meOption, groupOptions, userOptions };
}

function compareOptions(a, b) {
  if (a.isFixed !== b.isFixed) {
    return a.isFixed ? -1 : 1;
  }
  if (a.type !== b.type) {
    return typeOrder[a.type] - typeOrder[b.type];
  }
  return a.value.localeCompare(b.value);
}

export function toOption(user, me) {
  const isMe = user.username === me.username;
  return {
    label: isMe ? MY_FEED_LABEL : user.screenName || user.username,
    value: user.username,
    type: isMe ? ACC_ME : user.type === 'group' ? ACC_GROUP : ACC_USER,
    privacy: user.type === 'group' || isMe ? getPrivacy(user) : 'user',
  };
}

function privacyControlOptions() {
  return [...Object.entries(CONFIG.privacyControlGroups.groups)].map(
    ([value, { label, privacy }]) => ({
      label,
      value,
      privacy,
      type: ACC_GROUP,
    }),
  );
}
