import { Fragment } from 'react';
import cn from 'classnames';

import flagSrc from '../../assets/images/iran-lion-sun-flag.svg';
import { hasIranFlagEmoji, IRAN_FLAG, splitIranFlagEmoji } from '../utils/iran-flag-emoji';
import styles from './iran-flag-emoji.module.scss';

/**
 * Inline Lion and Sun flag image used instead of the 🇮🇷 emoji.
 */
export function IranFlagEmoji({ className, ...props }) {
  return (
    <img
      src={flagSrc}
      alt=""
      title="Iran"
      role="img"
      aria-label="Iran"
      draggable={false}
      className={cn(styles.flag, className)}
      {...props}
    />
  );
}

/**
 * Replace 🇮🇷 in a string with the custom flag image; leave other text as-is.
 * @param {unknown} text
 * @returns {import('react').ReactNode}
 */
export function withIranFlagEmoji(text) {
  if (typeof text !== 'string' || !hasIranFlagEmoji(text)) {
    return text;
  }

  return splitIranFlagEmoji(text).map((part, index) => {
    if (typeof part === 'object' && part.type === IRAN_FLAG) {
      return <IranFlagEmoji key={`iran-flag-${index}`} />;
    }
    return <Fragment key={`iran-flag-text-${index}`}>{part}</Fragment>;
  });
}
