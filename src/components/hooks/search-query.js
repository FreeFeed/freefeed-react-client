import { useNouter } from '../../services/nouter';

/**
 * Returns the current search query on search page
 */
export function useSearchQuery() {
  const {
    location: { pathname, query },
  } = useNouter();

  const q = query.q || query.qs || '';
  return ((pathname === '/search' && q) || '').trim();
}
