import { useStore } from 'react-redux';
import cn from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { Finder } from '../../utils/sparse-match';
import { UserPicture } from '../user-picture';
import { Icon } from '../fontawesome-icons';
import style from './autocomplete.module.scss';
import { HighlightText } from './highlight-text';

export function Selector({ query, events, onSelect }) {
  const [usernames, accountsMap] = useAccountsMap();

  const matches = useMemo(() => {
    const finder = new Finder(query, 5);
    for (const username of usernames) {
      finder.add(username);
    }

    return finder.results();
  }, [query, usernames]);

  const [cursor, setCursor] = useState(0);
  useEffect(() => setCursor(0), [matches]);

  const keyHandler = useEvent((key) => {
    switch (key) {
      case 'ArrowDown':
        setCursor((c) => (c + 1) % matches.length);
        break;
      case 'ArrowUp':
        setCursor((c) => (c - 1 + matches.length) % matches.length);
        break;
      case 'Enter':
        onSelect(matches[cursor].text);
        break;
    }
  });

  useEffect(() => events.subscribe(keyHandler), [events, keyHandler]);

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className={style.selector}>
      <ul className={style.list}>
        {matches.map((match, idx) => (
          <Item
            key={match.text}
            account={accountsMap.get(match.text)}
            match={match}
            isCurrent={idx === cursor}
            onClick={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

function Item({ account, match, isCurrent, onClick }) {
  const clk = useEvent(() => onClick(match.text));

  return (
    <li className={cn(style.item, isCurrent && style.itemCurrent)} onClick={clk}>
      <UserPicture user={account} size={20} withLink={false} className={style.itemImage} />
      <span className={style.itemText}>
        {account.type === 'group' && <Icon icon={faUserFriends} className={style.groupIcon} />}
        <span className={style.userName}>
          <HighlightText text={account.username} matches={match.matches} />
        </span>
        {account.username !== account.screenName && (
          <span className={style.screenName}>{account.screenName}</span>
        )}
      </span>
    </li>
  );
}

function useAccountsMap() {
  const store = useStore();

  return useMemo(() => {
    const state = store.getState();
    const accountsMap = new Map();
    const allAccounts = [
      ...Object.values(state.users),
      ...Object.values(state.subscriptions),
      ...Object.values(state.subscribers),
      ...state.managedGroups,
    ];

    for (const account of allAccounts) {
      account.username && accountsMap.set(account.username, account);
    }

    return [[...accountsMap.keys()], accountsMap];
  }, [store]);
}
