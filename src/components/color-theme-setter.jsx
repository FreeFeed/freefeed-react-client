import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

import { darkTheme as selectDarkTheme } from './select-utils';

export function ColorSchemeSetter() {
  const darkTheme = useSelector(selectDarkTheme);

  useEffect(
    () => void document.documentElement.classList.toggle('dark-theme', darkTheme),
    [darkTheme],
  );

  return (
    <Helmet defer={false}>
      <meta name="theme-color" content={darkTheme ? 'hsl(220, 9%, 10%)' : 'white'} />
    </Helmet>
  );
}
