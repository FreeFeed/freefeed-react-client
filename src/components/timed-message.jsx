import { useEffect, useState } from 'react';

export function TimedMessage({ children, message, timeout = 2000 }) {
  const [showTimed, setShowTimed] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimed(false);
    }, timeout);
    return () => clearTimeout(timer);
  }, [timeout]);

  return showTimed ? message : children;
}
