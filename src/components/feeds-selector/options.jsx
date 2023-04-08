import {
  faHome,
  faQuestion,
  faSpinner,
  faUser,
  faUsers,
  faUserSlash,
  faUsersSlash,
} from '@fortawesome/free-solid-svg-icons';
import { uniq } from 'lodash';
import { useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Icon } from '../fontawesome-icons';

// Local styles
import { getUserInfo } from '../../redux/action-creators';
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
  [ACC_GROUP]: faUsers,
  [ACC_USER]: faUser,
  [ACC_BAD_GROUP]: faUsersSlash,
  [ACC_BAD_USER]: faUserSlash,
  [ACC_UNKNOWN]: faSpinner,
  [ACC_NOT_FOUND]: faQuestion,
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

export function DisplayOption({ option, className }) {
  return (
    <span className={className} title={`@${option.value}`}>
      {option.type && <Icon className={styles['dest-icon']} icon={typeIcon[option.type]} />}
      {option.label}
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
      mySubscriptions
        .filter((u) => u?.type === 'group' && u.youCan.includes('post'))
        .map((u) => toOption(u, me))
        .sort(compareOptions),
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
            isFixed: fixedFeedNames.includes(name),
          };

          if (name === me.username) {
            // It's me!
            return { ...props, label: MY_FEED_LABEL, type: ACC_ME };
          }

          const acc = usersByName.get(name);
          if (acc?.type === 'group') {
            return {
              ...props,
              label: acc.screenName,
              type: acc.youCan.includes('post') ? ACC_GROUP : ACC_BAD_GROUP,
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
    [fixedFeedNames, me.username, usernames, usersByName, notFoundUsers],
  );

  // Load missing accounts
  useEffect(() => {
    values
      .filter((v) => v.type === ACC_UNKNOWN)
      .map((v) => v.value)
      .filter((username) => !userInfoStatuses[username])
      .forEach((username) => dispatch(getUserInfo(username)));
  }, [dispatch, userInfoStatuses, values]);

  const privacyLevel = useMemo(() => {
    if (values.every((v) => v.type === ACC_USER)) {
      return 'direct';
    }
    if (values.some((v) => v.type !== ACC_GROUP && v.type !== ACC_ME)) {
      return '';
    }
    for (const { value: username } of values) {
      const acc = usersByName.get(username);
      if (acc.isProtected === '0') {
        return 'public';
      } else if (acc.isPrivate === '0') {
        return 'protected';
      }
    }
    return 'private';
  }, [usersByName, values]);

  const meOption = useMemo(() => toOption(me, me), [me]);

  return { values, meOption, groupOptions, userOptions, privacyLevel };
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base', ignorePunctuation: true });
function compareOptions(a, b) {
  if (a.isFixed !== b.isFixed) {
    return a.isFixed ? -1 : 1;
  }
  if (a.type !== b.type) {
    return typeOrder[a.type] - typeOrder[b.type];
  }
  return collator.compare(a.label, b.label);
}

export function toOption(user, me) {
  const isMe = user.username === me.username;
  return {
    label: isMe
      ? MY_FEED_LABEL
      : user.type === 'group'
      ? user.screenName || user.username
      : user.username,
    value: user.username,
    type: isMe ? ACC_ME : user.type === 'group' ? ACC_GROUP : ACC_USER,
  };
}
