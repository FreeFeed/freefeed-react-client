import { useEffect } from 'react';
import { withRouter } from 'react-router';

const warning = 'Do you want to leave this page? Changes you made may not be saved.';

export const PreventPageLeaving = withRouter(function PreventPageLeaving({
  prevent = false,
  router,
  children,
}) {
  // Prevent leaving our site
  useEffect(() => {
    if (prevent) {
      const handler = (e) => (e.preventDefault(), (e.returnValue = warning));
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [prevent]);

  // Prevent react-router transition to the other page of our site
  useEffect(() => router.listenBefore(() => (prevent ? warning : undefined)), [prevent, router]);

  return children || null;
});
