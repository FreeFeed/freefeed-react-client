import React, { useCallback, useState } from 'react';
import { withRouter } from 'react-router';
import { KEY_RETURN, KEY_ESCAPE } from 'keycode-js';
import { useSelector } from 'react-redux';

export default function SearchForm() {
  const query = useSelector((state) => {
    const { pathname, query } = state.routing.locationBeforeTransitions;
    return (pathname === '/search' && query.qs) || '';
  });
  return <SearchInput query={query} key={query} />;
}

const SearchInput = withRouter(function SearchInput({ router, query: initialQuery }) {
  const [query, setQuery] = useState(initialQuery);

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
