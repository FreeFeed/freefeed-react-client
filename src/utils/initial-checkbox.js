import { Token } from 'social-text-tokenizer';

/**
 * U+2713 Check Mark (🗸)
 * U+2714 Heavy Check Mark (✔)
 * U+0445 Cyrillic Small Letter Ha (х)
 */
const checkBoxRe = /\[(?:\s*|[xv*\u2713\u2714\u0445])]/gi;

export const checkMark = '\u2713';

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasCheckbox(text) {
  return checkboxParser(text).length > 0;
}

export class InitialCheckbox extends Token {
  /**
   * @returns {boolean}
   */
  get checked() {
    return isChecked(this.text);
  }
}

/**
 * @param {string} text
 * @returns {Token[]}
 */
export function checkboxParser(text) {
  const matches = [...text.matchAll(checkBoxRe)];
  if (matches.length !== 1 || matches[0].index !== 0) {
    return [];
  }
  return [new InitialCheckbox(0, matches[0][0])];
}

/**
 * @param {string} text
 * @returns {boolean}
 */
export function isChecked(text) {
  return !/[\s\]]/.test(text[1]);
}

/**
 * @param {string} text
 * @param {boolean} newState
 * @returns {string}
 */
export function setCheckState(text, newState) {
  const [t] = checkboxParser(text);
  return `[${newState ? checkMark : ' '}] ${text.slice(t.offset + t.text.length).trim()}`;
}
