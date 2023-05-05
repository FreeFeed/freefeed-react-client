import { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

export function usePrivacyCheck(feedNames) {
  const myName = useSelector((store) => store.user.username);
  const allUsers = useSelector((store) => Object.values(store.users), shallowEqual);
  const level = useMemo(() => {
    const accounts = feedNames.map((n) => allUsers.find((u) => u.username === n));

    if (accounts.length === 0 || accounts.some((u) => !u)) {
      return '';
    }
    if (accounts.every((u) => u.type === 'user' && u.username !== myName)) {
      return 'direct';
    }

    for (const acc of accounts) {
      if (acc.type === 'user' && acc.username !== myName) {
        return '';
      }
      if (acc.isProtected === '0') {
        return 'public';
      }
      if (acc.isPrivate === '0') {
        return 'protected';
      }
    }
    return 'private';
  }, [allUsers, feedNames, myName]);

  const problematicGroups = useMemo(() => {
    if (level === 'public') {
      const accounts = feedNames.map((n) => allUsers.find((u) => u.username === n));
      return accounts.filter((acc) => acc.isProtected === '1').map((acc) => acc.username);
    }
    if (level === 'protected') {
      const accounts = feedNames.map((n) => allUsers.find((u) => u.username === n));
      return accounts.filter((acc) => acc.isPrivate === '1').map((acc) => acc.username);
    }
    return [];
  }, [allUsers, feedNames, level]);

  return [level, problematicGroups];
}
