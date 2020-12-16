import { useCallback, useState, useMemo, useEffect } from 'react';
import { withRouter } from 'react-router';
import { KEY_RETURN, KEY_ESCAPE } from 'keycode-js';
import { useSearchQuery } from './hooks/search-query';

export default withRouter(function SearchForm({ router }) {
  const urlQuery = useSearchQuery();
  const preQuery = useMemo(() => {
    const route = router.routes[router.routes.length - 1];
    switch (route.name) {
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
  }, [router.routes, router.params]);

  const initialQuery = urlQuery || preQuery;

  const [query, setQuery] = useState(initialQuery);

  // Handle navigation
  useEffect(() => setQuery(initialQuery), [initialQuery]);

  const performSearch = useCallback(
    () => query.trim() !== '' && router.push(`/search?qs=${encodeURIComponent(query.trim())}`),
    [query, router],
  );

  const onChange = useCallback(({ target }) => setQuery(target.value), []);

  const onKeyDown = useCallback(
    ({ target, keyCode }) => {
      if (keyCode === KEY_ESCAPE) {
        target.blur();
        setQuery(initialQuery);
      }
      if (keyCode === KEY_RETURN) {
        target.blur();
        performSearch();
      }
    },
    [performSearch, initialQuery],
  );

  return (
    <div className="search-form">
      <input
        value={query}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Search request"
        className="search-input"
      />
      <button type="button" className="search-button" onClick={performSearch}>
        Search
      </button>
    </div>
  );
});
