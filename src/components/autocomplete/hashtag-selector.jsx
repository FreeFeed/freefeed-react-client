import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { Finder } from '../../utils/sparse-match';
import { getMatchedHashtags } from '../../redux/action-creators';
import style from './autocomplete.module.scss';
import { HighlightText } from './highlight-text';
import { getRankedNames } from './ranked-names';
import { normalizeHashtag } from '../../utils/sparse-match/normalize-hashtags';

export function HashtagSelector({ query, events, onSelect }) {
  query = normalizeHashtag(query).output;
  const dispatch = useDispatch();
  const [hashtags, compare, htMap] = useHashtagVariants();

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
        onSelect(matches[cursor].text ? htMap.get(matches[cursor].text).name : query);
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
            variant={htMap.get(match.text)}
            match={match}
            isCurrent={idx === cursor}
            onClick={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

function Item({ variant, match, isCurrent, onClick }) {
  const clk = useEvent(() => onClick(variant.name));

  // Convert matches from normalized string indices to original string indices
  const originalMatches = useMemo(() => {
    const result = [];
    for (const idx of match.matches) {
      const mapped = variant.mapping[idx];
      if (mapped) {
        result.push(...mapped);
      }
    }
    return result;
  }, [match.matches, variant.mapping]);

  return (
    <li className={cn(style.item, style.itemHashtag, isCurrent && style.itemCurrent)} onClick={clk}>
      <span>#</span>
      <span className={style.itemText}>
        <span className={style.userName}>
          <HighlightText text={variant.name} matches={originalMatches} />
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
    const hashtagsMap = new Map();
    for (const v of variants) {
      if (v.is_own) {
        ownHashtags.add(v.normalized);
      } else {
        otherHashtags.add(v.normalized);
      }
      hashtagsMap.set(v.normalized, v);
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

    return [variants.map((v) => v.normalized), compare, hashtagsMap];
  }, [lastQuery, variants]);
}
