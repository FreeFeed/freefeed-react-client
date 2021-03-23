import { useSelector } from 'react-redux';

/**
 * Returns the current search query on search page
 */
export function useSearchQuery() {
  const query = useSelector((state) => {
    const { pathname, query } = state.routing.locationBeforeTransitions;
    const q = query.q || query.qs || '';
    return ((pathname === '/search' && q) || '').trim();
  });

  return query;
}
