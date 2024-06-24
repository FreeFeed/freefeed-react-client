import { useDispatch, useStore } from 'react-redux';
import cn from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { Finder } from '../../utils/sparse-match';
import { UserPicture } from '../user-picture';
import { Icon } from '../fontawesome-icons';
import { usePost } from '../post/post-comment-ctx';
import { getMatchedUsers, showMoreComments } from '../../redux/action-creators';
import style from './autocomplete.module.scss';
import { HighlightText } from './highlight-text';
import {
  getAllGroups,
  getAllUsers,
  getMyFriends,
  getMyGroups,
  getMySubscribers,
  getPostParticipants,
  getRankedNames,
} from './ranked-names';

export function Selector({ query, events, onSelect, context }) {
  const dispatch = useDispatch();
  const [usernames, accountsMap, compare] = useAccountsMap({ context });

  // Request all users/groups when query longer than 2 chars
  const lastQuery = useRef('');
  useEffect(() => {
    const lc = lastQuery.current;
    if (query.length < 2 || (lc && query.slice(0, lc.length) === lc)) {
      return;
    }
    lastQuery.current = query;
    dispatch(getMatchedUsers(query));
  }, [dispatch, query]);

  const matches = useMemo(() => {
    const finder = new Finder(query, 5, compare);
    for (const username of usernames) {
      finder.add(username);
    }

    return finder.results();
  }, [compare, query, usernames]);

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

function useAccountsMap({ context }) {
  const store = useStore();
  const post = usePost();

  useEffect(() => {
    if (context !== 'comment' || !post) {
      return;
    }
    const postState = store.getState().postsViewState[post?.id];
    if (post?.omittedComments > 0 && !postState?.loadingComments) {
      store.dispatch(showMoreComments(post.id));
    }
  }, [context, post, store]);

  return useMemo(() => {
    const state = store.getState();
    const accountsMap = new Map();
    let rankedNames;

    if (context === 'comment') {
      rankedNames = getRankedNames(
        post && getPostParticipants(post, state),
        getMyFriends(state),
        getMyGroups(state),
        getMySubscribers(state),
        getAllUsers(state),
        getAllGroups(state),
      );
    } else {
      rankedNames = getRankedNames(
        getMyFriends(state),
        getMyGroups(state),
        getMySubscribers(state),
        getAllUsers(state),
        getAllGroups(state),
      );
    }

    function compare(a, b) {
      const aRank = a.rank + 10 / (1 + (rankedNames.get(a.text) ?? 0));
      const bRank = b.rank + 10 / (1 + (rankedNames.get(b.text) ?? 0));
      if (aRank === bRank) {
        return a.text.localeCompare(b.text);
      }
      return bRank - aRank;
    }

    const allAccounts = [
      ...Object.values(state.users),
      ...Object.values(state.subscribers),
      ...state.user.subscribers,
    ];

    for (const account of allAccounts) {
      account.username && accountsMap.set(account.username, account);
    }

    return [[...accountsMap.keys()], accountsMap, compare];
  }, [context, post, store]);
}
