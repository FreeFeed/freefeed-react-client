import { reTokenizer, makeToken } from 'social-text-tokenizer/utils';
/**
 * @typedef {import('social-text-tokenizer').Tokenizer} Tokenizer
 */

export const SPOILER_START = 'SPOILER_START';
export const SPOILER_END = 'SPOILER_END';

export const spoilerTags = reTokenizer(/<(\/)?(?:spoiler|спойлер)>/gi, (offset, text, match) =>
  makeToken(match[1] ? SPOILER_END : SPOILER_START)(offset, text),
);

/**
 * Make sure that the list of tokens contains only valid pairs of
 * StartSpoiler/EndSpoiler tokens
 *
 * @param {Tokenizer} tokenizer
 * @returns {Tokenizer}
 */
export function validateSpoilerTags(tokenizer) {
  return function (text) {
    const validated = [];
    let startSpoilerIndex = -1;
    const tokens = tokenizer(text);

    for (const [i, token] of tokens.entries()) {
      if (token.type === SPOILER_START) {
        if (startSpoilerIndex !== -1) {
          // previous StartSpoiler is invalid
          validated[startSpoilerIndex] = null;
        }
        startSpoilerIndex = i;
        validated.push(token);
      } else if (token.type === SPOILER_END) {
        if (startSpoilerIndex !== -1) {
          startSpoilerIndex = -1;
          validated.push(token);
        }
      } else {
        validated.push(token);
      }
    }

    if (startSpoilerIndex !== -1) {
      // un-closed StartSpoiler
      validated[startSpoilerIndex] = null;
    }

    return validated.filter(Boolean);
  };
}
