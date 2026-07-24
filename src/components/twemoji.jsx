import { createElement, useLayoutEffect, useRef } from 'react';
import cn from 'classnames';
import twemoji from '@twemoji/api';

import iranLionSunFlag from '../../assets/images/twemoji-1f1ee-1f1f7.svg';
import styles from './twemoji.module.scss';

/** Twemoji codepoint for 🇮🇷 (regional indicators I + R). */
const IRAN_FLAG_ICON = '1f1ee-1f1f7';

const parseOptions = {
  folder: 'svg',
  ext: '.svg',
  className: 'twemoji',
  /**
   * Use the published Twemoji CDN for everything; only swap Iran to the local
   * Lion and Sun SVG (from twitter/twemoji, not yet in the npm asset cut).
   */
  callback(icon, options) {
    if (icon === IRAN_FLAG_ICON) {
      return iranLionSunFlag;
    }
    return ''.concat(options.base, options.folder, '/', icon, options.ext);
  },
};

/**
 * Renders children and replaces Unicode emoji with Twemoji SVGs.
 */
export function Twemoji({ children, tag = 'span', className, ...props }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (ref.current) {
      twemoji.parse(ref.current, parseOptions);
    }
  });

  return createElement(tag, { ...props, className: cn(styles.root, className), ref }, children);
}
