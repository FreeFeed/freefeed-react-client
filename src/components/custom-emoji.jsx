import { Fragment } from 'react';
import cn from 'classnames';

import {
  CUSTOM_EMOJI,
  emojiOverrideByEmoji,
  hasCustomEmoji,
  splitCustomEmojis,
} from '../utils/emoji-overrides';
import styles from './custom-emoji.module.scss';

/**
 * Inline image for a registered custom emoji override.
 * @param {{ emoji: string, className?: string } & import('react').ImgHTMLAttributes<HTMLImageElement>} props
 */
export function CustomEmoji({ emoji, className, ...props }) {
  const override = emojiOverrideByEmoji[emoji];
  if (!override) {
    return emoji;
  }

  return (
    <img
      src={override.src}
      alt=""
      title={override.label}
      role="img"
      aria-label={override.label}
      draggable={false}
      className={cn(styles.emoji, className)}
      {...props}
    />
  );
}

/**
 * Replace registered custom emojis in a string with images; leave other text as-is.
 * @param {unknown} text
 * @returns {import('react').ReactNode}
 */
export function withCustomEmojis(text) {
  if (typeof text !== 'string' || !hasCustomEmoji(text)) {
    return text;
  }

  return splitCustomEmojis(text).map((part, index) => {
    if (typeof part === 'object' && part.type === CUSTOM_EMOJI) {
      return <CustomEmoji key={`custom-emoji-${index}`} emoji={part.emoji} />;
    }
    return <Fragment key={`custom-emoji-text-${index}`}>{part}</Fragment>;
  });
}
