/* global CONFIG */
import { IndexLink, Link, withRouter } from 'react-router';
import { faBars, faSearch, faSignInAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { KEY_ESCAPE } from 'keycode-js';
import { useDispatch, useSelector } from 'react-redux';

import { openSidebar } from '../redux/action-creators';
import { Icon } from './fontawesome-icons';
import { useMediaQuery } from './hooks/media-query';
import styles from './layout-header.module.scss';
import { SignInLink } from './sign-in-link';

export const LayoutHeader = withRouter(function LayoutHeader({ router }) {
  const dispatch = useDispatch();
  const onSearchPage = router.routes[router.routes.length - 1].name === 'search';
  const isLayoutWithSidebar = useMediaQuery('(min-width: 992px)');
  const isWideScreen = useMediaQuery('(min-width: 700px)');
  const isNarrowScreen = useMediaQuery('(max-width: 549px)');

  const authenticated = useSelector((state) => state.authenticated);

  const [searchExpanded, setSearchExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const onQueryChange = useCallback(({ target }) => setQuery(target.value), []);

  const fullSearchForm = isWideScreen;
  const compactSearchForm = !fullSearchForm;
  const collapsibleSearchForm = isNarrowScreen && (!onSearchPage || searchExpanded);

  useEffect(() => !collapsibleSearchForm && setSearchExpanded(false), [collapsibleSearchForm]);

  const openSearchForm = useCallback(() => setSearchExpanded(true), []);
  const closeSearchForm = useCallback(() => setSearchExpanded(false), []);

  const initialQuery = useInitialQuery(router);
  const input = useRef(null);
  useEffect(() => void setQuery(initialQuery), [initialQuery]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const q = query.trim();
      if (q !== '') {
        router.push(`/search?qs=${encodeURIComponent(q)}`);
        input.current.blur();
      }
    },
    [router, query],
  );

  const onKeyDown = useCallback((e) => e.keyCode === KEY_ESCAPE && input.current.blur(), []);

  const clearSearchForm = useCallback(() => (setQuery(''), input.current.focus()), []);

  const onFocus = useCallback(() => isNarrowScreen && onSearchPage && setSearchExpanded(true), [
    isNarrowScreen,
    onSearchPage,
  ]);

  const doOpenSidebar = useCallback(() => dispatch(openSidebar(true)), [dispatch]);

  const focusHandlers = useDebouncedFocus({
    onFocus,
    onBlur: closeSearchForm,
  });

  const searchForm = (
    <form className={styles.searchForm} action="/search" onSubmit={onSubmit}>
      <span className={styles.searchInputContainer} {...focusHandlers} tabIndex={0}>
        <input
          className={styles.searchInput}
          type="text"
          name="q"
          ref={input}
          placeholder="Search request"
          autoFocus={collapsibleSearchForm}
          value={query}
          onChange={onQueryChange}
          onKeyDown={onKeyDown}
          tabIndex={-1}
        />
        {compactSearchForm && <Icon icon={faSearch} className={styles.searchIcon} />}
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
      </span>
      {fullSearchForm && (
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      )}
    </form>
  );

  const sidebarButton =
    !isLayoutWithSidebar &&
    (authenticated ? (
      <button
        type="button"
        aria-label="Open sidebar"
        title="Open sidebar"
        className={cn(styles.compactButton, styles.openSidebarButton)}
        onClick={doOpenSidebar}
      >
        <Icon icon={faBars} />
      </button>
    ) : (
      <SignInLink
        className={cn(styles.signInButton, styles.compactButton)}
        aria-label="Sign In"
        title="Sign In"
      >
        <Icon icon={faSignInAlt} />
      </SignInLink>
    ));

  return (
    <header
      className={cn(
        styles.header,
        fullSearchForm && styles.fullMode,
        compactSearchForm && styles.compactMode,
        collapsibleSearchForm && styles.collapsibleMode,
      )}
    >
      {searchExpanded ? (
        <div className={styles.searchExpandedCont}>
          {searchForm}
          {sidebarButton}
        </div>
      ) : (
        <>
          <h1 className={styles.logo}>
            <IndexLink className={styles.logoLink} to="/">
              {CONFIG.siteTitle}
            </IndexLink>
            {CONFIG.betaChannel.enabled && CONFIG.betaChannel.isBeta && (
              <Link to="/settings/appearance#beta" className="site-logo-subheading">
                {CONFIG.betaChannel.subHeading}
              </Link>
            )}
          </h1>
          <div className={styles.activeElements}>
            {!collapsibleSearchForm && searchForm}
            <span className={styles.buttons}>
              {collapsibleSearchForm && (
                <button
                  type="button"
                  aria-label="Open search form"
                  title="Open search form"
                  onClick={openSearchForm}
                  className={styles.compactButton}
                >
                  <Icon icon={faSearch} />
                </button>
              )}
              {sidebarButton}
            </span>
          </div>
        </>
      )}
      {isLayoutWithSidebar && !authenticated && (
        <SignInLink className={styles.signInLink}>Sign In</SignInLink>
      )}
    </header>
  );
});

function useInitialQuery(router) {
  return useMemo(() => {
    const route = router.routes[router.routes.length - 1];
    switch (route.name) {
      case 'search':
        return (router.location.query.qs || '').trim();
      case 'saves':
        return `in-my:saves `;
      case 'discussions':
        return `in-my:discussions `;
      case 'direct':
        return `in-my:directs `;
      case 'userLikes':
        return `liked-by:${router.params.userName} `;
      case 'userComments':
        return `commented-by:${router.params.userName} `;
      case 'userFeed':
        return `in:${router.params.userName} `;
      default:
        return '';
    }
  }, [router.routes, router.params, router.location]);
}

function useDebouncedFocus({ onFocus: onFocusOrig, onBlur: onBlurOrig }, interval = 100) {
  const focusTimer = useRef(0);
  const blurTimer = useRef(0);

  const cleanup = useCallback(() => {
    window.clearTimeout(blurTimer.current);
    window.clearTimeout(focusTimer.current);
  }, []);
  useEffect(() => () => cleanup(), [cleanup]);

  const onFocus = useCallback(() => {
    cleanup();
    focusTimer.current = window.setTimeout(onFocusOrig, interval);
  }, [cleanup, onFocusOrig, interval]);
  const onBlur = useCallback(() => {
    cleanup();
    blurTimer.current = window.setTimeout(onBlurOrig, interval);
  }, [cleanup, onBlurOrig, interval]);

  return { onFocus, onBlur };
}
