import { escapeRegExp } from 'lodash';

/**
 * This function inserts 'insertion' into the initial 'text'
 * and returns the resulting text with the new cursor/selection positions.
 * It is used for inserting mentions and arrows into comments.
 * Function controls the placement of spaces and prevents
 * the re-insertion of the same text.
 *
 * @param {string} insertion text to insert
 * @param {string} text initial text
 * @param {number} selStart selection start in initial text
 * @param {number} selEnd selection end in initial text
 * @returns {[string, number, number]}
 */
export function insertText(insertion, text, selStart, selEnd) {
  // Do not change text if one of selection edges
  // is near the same text as insertion.
  {
    const guardRe = new RegExp(`(^|\\s+)${escapeRegExp(insertion)}(\\s+|$)`, 'g');
    let m;
    while ((m = guardRe.exec(text)) !== null) {
      if (
        (selStart >= m.index && selStart <= m.index + m[0].length) ||
        (selEnd >= m.index && selEnd <= m.index + m[0].length)
      ) {
        return [text, selStart, selEnd];
      }
    }
  }

  // Ignore any text between selStart and selEnd
  const before = text.substring(0, selStart);
  const after = text.substring(selEnd);

  if (before.match(/\S$/)) {
    insertion = ` ${insertion}`;
  }
  const cursorPos = before.length + insertion.length + 1;
  if (!after.match(/^\s/)) {
    insertion = `${insertion} `;
  }

  return [before + insertion + after, cursorPos, cursorPos];
}
