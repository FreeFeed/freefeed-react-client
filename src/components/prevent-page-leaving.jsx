import { useEffect } from 'react';

const warning = 'Do you want to leave this page? Changes you made may not be saved.';

export function PreventPageLeaving({ prevent = false, children }) {
  // Prevent leaving our site
  useEffect(() => {
    if (prevent) {
      const handler = (e) => (e.preventDefault(), (e.returnValue = warning));
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [prevent]);

  // Prevent react-router transition to the other page of our site
  // TODO WOUTER: implement
  // useEffect(() => router.listenBefore(() => (prevent ? warning : undefined)), [prevent, router]);

  return children || null;
}
