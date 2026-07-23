import { makeToken, reTokenizer } from 'social-text-tokenizer/utils';

import iranLionSunFlag from '../../assets/images/iran-lion-sun-flag.svg';

export const CUSTOM_EMOJI = 'CUSTOM_EMOJI';

/**
 * Emoji → custom image overrides. Add entries here to replace more emojis in the UI.
 * @type {ReadonlyArray<{ emoji: string, src: string, label: string }>}
 */
export const emojiOverrides = [
  {
    // Iran regional-indicator flag: 🇮🇷 → Lion and Sun (Shir-o-Khorshid)
    emoji: '\u{1F1EE}\u{1F1F7}',
    src: iranLionSunFlag,
    label: 'Iran',
  },
];

/** @type {Readonly<Record<string, (typeof emojiOverrides)[number]>>} */
export const emojiOverrideByEmoji = Object.fromEntries(
  emojiOverrides.map((entry) => [entry.emoji, entry]),
);

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @returns {RegExp | null}
 */
function getOverridesRegex() {
  if (emojiOverrides.length === 0) {
    return null;
  }

  const pattern = [...emojiOverrides]
    .sort((a, b) => b.emoji.length - a.emoji.length)
    .map((entry) => escapeRegExp(entry.emoji))
    .join('|');

  return new RegExp(pattern, 'gu');
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasCustomEmoji(text) {
  return typeof text === 'string' && emojiOverrides.some((entry) => text.includes(entry.emoji));
}

/**
 * Split text into plain strings and custom-emoji markers.
 * @param {string} text
 * @returns {Array<string | { type: typeof CUSTOM_EMOJI, emoji: string }>}
 */
export function splitCustomEmojis(text) {
  const regex = getOverridesRegex();
  if (!regex || !hasCustomEmoji(text)) {
    return [text];
  }

  const result = [];
  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    result.push({ type: CUSTOM_EMOJI, emoji: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/**
 * Tokenizer for social-text-tokenizer / parseText.
 * @returns {import('social-text-tokenizer').Tokenizer}
 */
export function customEmojiTokenizer() {
  const regex = getOverridesRegex();
  if (!regex) {
    return () => [];
  }
  return reTokenizer(regex, makeToken(CUSTOM_EMOJI));
}
