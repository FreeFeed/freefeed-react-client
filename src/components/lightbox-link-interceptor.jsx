import { useEffect } from 'react';
import { useNouter } from '../services/nouter';

/**
 * Intercepts clicks on .pswp-caption__link elements (inside the PhotoSwipe
 * lightbox) and navigates via the SPA router instead of a full page reload.
 */
export function LightboxLinkInterceptor() {
  const { navigate } = useNouter();

  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest?.('.pswp-caption__link');
      if (!link) {
        return;
      }
      // Let the browser handle modified clicks and non-left-button clicks
      if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || e.button !== 0) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || !href.startsWith('/')) {
        return;
      }
      e.preventDefault();

      // The lightbox pushes a history entry on open and calls history.back()
      // on destroy (unless closed by navigation). Triggering history.back()
      // here makes the lightbox's popstate handler close it with the
      // closedByNavigation flag, so it won't call history.back() again.
      // We then navigate after the small timeout to allow the lightbox cleanup.
      history.back();
      setTimeout(() => navigate(href), 500);
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [navigate]);

  return null;
}
