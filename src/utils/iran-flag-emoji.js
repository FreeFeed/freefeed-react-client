/**
 * Iran regional-indicator flag emoji: 🇮🇷 (U+1F1EE U+1F1F7).
 * Replaced in the UI with the Lion and Sun (Shir-o-Khorshid) flag image.
 */
export const IRAN_FLAG_EMOJI = '\u{1F1EE}\u{1F1F7}';
export const IRAN_FLAG = 'IRAN_FLAG';

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasIranFlagEmoji(text) {
  return typeof text === 'string' && text.includes(IRAN_FLAG_EMOJI);
}

/**
 * Split text into segments of plain strings and Iran-flag markers.
 * @param {string} text
 * @returns {Array<string | { type: typeof IRAN_FLAG }>}
 */
export function splitIranFlagEmoji(text) {
  if (!hasIranFlagEmoji(text)) {
    return [text];
  }

  const parts = text.split(IRAN_FLAG_EMOJI);
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      result.push(parts[i]);
    }
    if (i < parts.length - 1) {
      result.push({ type: IRAN_FLAG });
    }
  }
  return result;
}
