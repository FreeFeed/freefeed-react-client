import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function UIScaleSetter() {
  const scale = useSelector((state) => state.uiScale);
  useEffect(() => (document.documentElement.style.fontSize = `${(10 * scale) / 100}px`), [scale]);
  return null;
}
