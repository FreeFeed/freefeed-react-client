import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export function UIScaleSetter() {
  const scale = useSelector((state) => state.uiScale);
  const [systemScale, setSystemScale] = useState(null);

  useEffect(() => {
    // Create a test element (that is subject to font-boosting) to measure the
    // OS/browser font size
    const testElement = document.body.appendChild(document.createElement('div'));
    testElement.style.fontSize = '1rem';
    // We must postpone the measurement so that the browser has time to apply
    // font boosting
    setTimeout(() => {
      const systemTextSize = parseInt(getComputedStyle(testElement).fontSize);
      // The default font size in most browsers is 16px, but we define body's
      // font size as 14/16 rem's.
      setSystemScale(isFinite(systemTextSize) ? systemTextSize / 16 : 1);
      testElement.parentElement.removeChild(testElement);
    }, 0);
  }, []);

  useEffect(() => {
    if (systemScale === null) {
      return;
    }
    document.documentElement.style.fontSize = `${(16 * systemScale * scale) / 100}px`;
  }, [systemScale, scale]);

  return null;
}
