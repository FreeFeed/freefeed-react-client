import { useSelector } from 'react-redux';

/**
 * Returns the current search query on search page
 */
export function useSearchQuery() {
  const query = useSelector((state) => {
    const { pathname, query } = state.routing.locationBeforeTransitions;
    return ((pathname === '/search' && query.qs) || '').trim();
  });

  return query;
}
