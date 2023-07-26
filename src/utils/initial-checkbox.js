import { Token } from 'social-text-tokenizer';

/**
 * U+2713 Check Mark (🗸)
 * U+2714 Heavy Check Mark (✔)
 * U+0445 Cyrillic Small Letter Ha (х)
 */
const checkBoxRe = /^\[(?:\s*|[xv*\u2713\u2714\u0445])]/i;

export const checkMark = '\u2713';

/**
 * @param {string} text
 * @returns {boolean}
 */
export function hasCheckbox(text) {
  return checkBoxRe.test(text);
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
  const m = checkBoxRe.exec(text);
  return m ? [new InitialCheckbox(0, m[0])] : [];
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
  return `[${newState ? checkMark : ' '}] ${text.replace(checkBoxRe, '').trim()}`;
}
