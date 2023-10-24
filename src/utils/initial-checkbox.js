import { makeToken, reTokenizer } from 'social-text-tokenizer/utils';

/**
 * U+2713 Check Mark (🗸)
 * U+2714 Heavy Check Mark (✔)
 * U+0445 Cyrillic Small Letter Ha (х)
 */
const checkBoxRe = /\[(?:\s*|[xv*\u2713\u2714\u0445])]/gi;

export const checkMark = '\u2713';
export const INITIAL_CHECKBOX = 'INITIAL_CHECKBOX';

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasCheckbox(text) {
  return checkboxParser(text).length > 0;
}

/**
 * @param {string} text
 * @returns {Token[]}
 */
export function checkboxParser(text) {
  const matches = reTokenizer(checkBoxRe, makeToken(INITIAL_CHECKBOX))(text);
  if (matches.length === 1 && matches[0].offset === 0) {
    return [matches[0]];
  }
  return [];
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isChecked(text) {
  // Check if the second character is a space or a ']'. The first character is
  // always a '['.
  return !/[\s\]]/.test(text[1]);
}

/**
 * @param {string} text
 * @param {boolean} newState
 * @returns {string}
 */
export function setCheckState(text, newState) {
  const [t] = checkboxParser(text);
  if (!t) {
    return text;
  }
  return `[${newState ? checkMark : ' '}] ${text.slice(t.offset + t.text.length).trim()}`;
}
