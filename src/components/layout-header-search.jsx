import cn from 'classnames';
import { Link, useLocation, useParams } from 'wouter';
import { faSearch, faSlidersH, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useEvent } from 'react-use-event-hook';

import { KEY_ESCAPE } from 'keycode-js';
import { useSelector } from 'react-redux';
import { useWouter } from '../services/wouter/with-router';
import styles from './layout-header.module.scss';
import { Icon } from './fontawesome-icons';
import { Autocomplete } from './autocomplete/autocomplete';
import { useMediaQuery } from './hooks/media-query';

const autocompleteAnchor = /(^|[^a-z\d])@|((from|to|author|by|in|commented-?by|liked-?by):)/gi;

export const HeaderSearchForm = function HeaderSearchForm({ closeSearchForm }) {
  const isWideScreen = useMediaQuery('(min-width: 700px)');
  const isNarrowScreen = useMediaQuery('(max-width: 549px)');

  const [query, setQuery] = useState('');
  const onQueryChange = useEvent(({ target }) => setQuery(target.value));

  const fullSearchForm = isWideScreen;
  const compactSearchForm = !fullSearchForm;
  const collapsibleSearchForm = isNarrowScreen;

  const initialQuery = useInitialQuery();
  const input = useRef(null);
  useEffect(() => void setQuery(initialQuery), [initialQuery]);

  const [, navigate] = useLocation();

  const onSubmit = useEvent((e) => {
    e.preventDefault();
    const q = query.trim();
    if (q !== '') {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      input.current.blur();
    }
  });

  const advancedSearchClick = useEvent(() => document.activeElement?.blur());

  const onKeyDown = useEvent((e) => e.keyCode === KEY_ESCAPE && input.current.blur());
  const clearSearchForm = useEvent(() => (setQuery(''), input.current.focus()));

  const onBlur = useEvent((e) => {
    // When the new focus is outside the search form
    if (!e.currentTarget.contains(e.relatedTarget)) {
      closeSearchForm();
    }
  });

  useEffect(() => {
    const abortController = new AbortController();
    document.addEventListener(
      'keydown',
      (e) => {
        if (document.activeElement !== document.body) {
          return;
        }
        if (
          // [/] or Ctrl+[K]
          (e.code === 'Slash' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) ||
          (e.code === 'KeyK' && e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey)
        ) {
          input.current.focus();
          e.preventDefault();
        }
      },
      { signal: abortController.signal },
    );
    return () => abortController.abort();
  }, []);

  return (
    <form className={styles.searchForm} action="/search" onSubmit={onSubmit}>
      <span className={styles.searchInputContainer} onBlur={onBlur} tabIndex={0}>
        <span className={styles.searchInputBox}>
          <input
            className={styles.searchInput}
            type="text"
            name="q"
            ref={input}
            placeholder={isWideScreen ? 'Press / to search' : ''}
            autoFocus={collapsibleSearchForm}
            autoComplete="off"
            value={query}
            onChange={onQueryChange}
            onKeyDown={onKeyDown}
            tabIndex={-1}
          />
          <button
            type="button"
            className={cn(styles.clearSearchButton, styles.compactButton)}
            aria-label="Clear search form"
            title="Clear search form"
            onClick={clearSearchForm}
            tabIndex={-1}
          >
            <Icon icon={faTimesCircle} />
          </button>
          <div className={styles.autocompleteBox}>
            <Link
              className={styles.advancedSearch}
              to={`/search?q=${encodeURIComponent(query.trim())}&advanced`}
              onClick={advancedSearchClick}
            >
              <Icon icon={faSlidersH} className={styles.advancedSearchIcon} />
              <span>Advanced search options</span>
            </Link>
            <Autocomplete inputRef={input} context="search" anchor={autocompleteAnchor} />
          </div>
        </span>
        {compactSearchForm && <Icon icon={faSearch} className={styles.searchIcon} />}
      </span>
      {fullSearchForm && (
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      )}
    </form>
  );
};

function useInitialQuery() {
  const { name: routeName } = useWouter();
  const params = useParams();
  const loc = useSelector((state) => state.routing.locationBeforeTransitions);
  return useMemo(() => {
    switch (routeName) {
      case 'search':
        return (loc.query.q || loc.query.qs || '').trim();
      case 'saves':
        return `in-my:saves `;
      case 'discussions':
        return `in-my:discussions `;
      case 'direct':
        return `in-my:directs `;
      case 'userLikes':
        return `liked-by:${params.userName} `;
      case 'userComments':
        return `commented-by:${params.userName} `;
      case 'userFeed':
        return `in:${params.userName} `;
      default:
        return '';
    }
  }, [loc.query.q, loc.query.qs, params.userName, routeName]);
}
