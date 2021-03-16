/* global CONFIG */
import { IndexLink, Link, withRouter } from 'react-router';
import { faBars, faSearch, faSignInAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import { KEY_ESCAPE } from 'keycode-js';
import { useSelector } from 'react-redux';

import { Icon } from './fontawesome-icons';
import { useMediaQuery } from './hooks/media-query';
import styles from './layout-header.module.scss';
import { SignInLink } from './sign-in-link';

export const LayoutHeader = withRouter(function LayoutHeader({ router }) {
  const isLayoutWithSidebar = useMediaQuery('(min-width: 992px)');
  const isWideScreen = useMediaQuery('(min-width: 700px)');
  const isNarrowScreen = useMediaQuery('(max-width: 549px)');

  const authenticated = useSelector((state) => state.authenticated);

  const fullSearchForm = isWideScreen;
  const compactSearchForm = !fullSearchForm;
  const collapsibleSearchForm = isNarrowScreen;

  const [searchExpanded, setSearchExpanded] = useState(false);
  useEffect(() => !collapsibleSearchForm && setSearchExpanded(false), [collapsibleSearchForm]);

  const openSearchForm = useCallback(() => setSearchExpanded(true), []);
  const closeSearchForm = useCallback(() => setSearchExpanded(false), []);

  const initialQuery = useInitialQuery(router);
  const input = useRef(null);
  useEffect(() => void (input.current && (input.current.value = initialQuery)), [initialQuery]);

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const query = input.current?.value.trim() || '';
      if (query !== '') {
        router.push(`/search?qs=${encodeURIComponent(query)}`);
      }
    },
    [router],
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.keyCode === KEY_ESCAPE) {
        input.current.blur();
        input.current.value = initialQuery;
        closeSearchForm();
      }
    },
    [initialQuery, closeSearchForm],
  );

  const searchForm = (
    <form className={styles.searchForm} action="/search" onSubmit={onSubmit}>
      <input
        className={styles.searchInput}
        type="text"
        name="qs"
        ref={input}
        placeholder="Search request"
        autoFocus={collapsibleSearchForm}
        defaultValue={initialQuery}
        onKeyDown={onKeyDown}
      />
      {compactSearchForm && <Icon icon={faSearch} className={styles.searchIcon} />}
      {fullSearchForm && (
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      )}
      {collapsibleSearchForm && (
        <button
          type="button"
          className={cn(styles.closeSearchButton, styles.compactButton)}
          aria-label="Close search form"
          title="Close search form"
          onClick={closeSearchForm}
        >
          <Icon icon={faTimes} />
        </button>
      )}
    </form>
  );

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
        <div className={styles.searchExpandedCont}>{searchForm}</div>
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
              {!isLayoutWithSidebar &&
                (authenticated ? (
                  <button
                    type="button"
                    aria-label="Open sidebar"
                    title="Open sidebar"
                    className={cn(styles.compactButton, styles.openSidebarButton)}
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
                ))}
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
