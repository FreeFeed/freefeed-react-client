import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { Finder } from '../../utils/sparse-match';
import { getMatchedHashtags } from '../../redux/action-creators';
import style from './autocomplete.module.scss';
import { HighlightText } from './highlight-text';
import { getRankedNames } from './ranked-names';

export function HashtagSelector({ query, events, onSelect }) {
  query = query.toLowerCase();
  const dispatch = useDispatch();
  const [hashtags, compare] = useHashtagVariants();

  // Request hashtags with debounce to avoid interrupting input events.
  // Skip request if we already have results for a prefix of the current query.
  const lastQuery = useRef('');
  useEffect(() => {
    if (query.length === 0) {
      return;
    }

    const lq = lastQuery.current;
    if (lq && query.startsWith(lq)) {
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;

    const t = setTimeout(() => {
      lastQuery.current = query;
      dispatch(getMatchedHashtags(query, { signal }));
    }, 500);
    signal.addEventListener('abort', () => clearTimeout(t));

    return () => abortController.abort();
  }, [dispatch, query]);

  const matches = useMemo(() => {
    const compareWithExact = (a, b) => {
      if (a.text === query) {
        return -1;
      }
      if (b.text === query) {
        return 1;
      }
      return compare(a, b);
    };
    const finder = new Finder(query, 5, compareWithExact);
    for (const h of hashtags) {
      finder.add(h);
    }

    return finder.results();
  }, [compare, hashtags, query]);

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
      case 'Tab':
        onSelect(matches[cursor]?.text ?? query);
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
          <Item key={match.text} match={match} isCurrent={idx === cursor} onClick={onSelect} />
        ))}
      </ul>
    </div>
  );
}

function Item({ match, isCurrent, onClick }) {
  const clk = useEvent(() => onClick(match.text));

  return (
    <li className={cn(style.item, isCurrent && style.itemCurrent)} onClick={clk}>
      <span>#</span>
      <span className={style.itemText}>
        <span className={style.userName}>
          <HighlightText text={match.text} matches={match.matches} />
        </span>
      </span>
    </li>
  );
}

function useHashtagVariants() {
  const lastQuery = useSelector((state) => state.lastHashtagsAutocompleteQuery);
  const variants = useSelector((state) => state.hashtagsAutocompleteVariants);

  return useMemo(() => {
    // We need to refresh this on lastQuery change
    lastQuery;

    const ownHashtags = new Set();
    const otherHashtags = new Set();
    for (const v of variants) {
      if (v.is_own) {
        ownHashtags.add(v.name);
      } else {
        otherHashtags.add(v.name);
      }
    }

    const rankedNames = getRankedNames(ownHashtags, otherHashtags);

    function compare(a, b) {
      const aRank = a.rank + 10 / (1 + (rankedNames.get(a.text) ?? 0));
      const bRank = b.rank + 10 / (1 + (rankedNames.get(b.text) ?? 0));
      if (aRank === bRank) {
        return a.text.localeCompare(b.text);
      }
      return bRank - aRank;
    }

    return [variants.map((v) => v.name), compare];
  }, [lastQuery, variants]);
}
