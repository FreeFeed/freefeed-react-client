import { describe, it } from 'mocha';
import expect from 'unexpected';
import { insertText } from '../../../src/utils/insert-text';

describe('insertText', () => {
  const testData = [
    { input: '|', output: '@mention |' },
    { input: 'foo|', output: 'foo @mention |' },
    { input: 'foo |', output: 'foo @mention |' },
    { input: 'foo  |', output: 'foo  @mention |' },
    { input: '|foo', output: '@mention |foo' },
    { input: 'foo |bar', output: 'foo @mention |bar' },
    { input: 'foo| bar', output: 'foo @mention |bar' },
    { input: 'foo|  bar', output: 'foo @mention | bar' },
    { input: 'foo b|ar', output: 'foo b @mention |ar' },
    { input: 'foo| b|ar', output: 'foo @mention |ar' },
    { input: '|foo|', output: '@mention |' },
    { input: 'foo |bar|', output: 'foo @mention |' },
    { input: 'fo|o @mention bar', output: 'fo @mention |o @mention bar' },
    // Do not insert the same text twice
    { input: '|@mention', output: '|@mention' },
    { input: '@me|ntion', output: '@me|ntion' },
    { input: '@mention|', output: '@mention|' },
    { input: '@mention |', output: '@mention |' },
    { input: '@mention  |', output: '@mention  |' },
    { input: 'foo| @mention', output: 'foo| @mention' },
    { input: 'fo|o @ment|ion', output: 'fo|o @ment|ion' },
    { input: 'foo| @mention bar', output: 'foo| @mention bar' },
    { input: 'foo @mention |bar', output: 'foo @mention |bar' },
  ];

  testData.forEach(({ input, output }) => {
    it(`test '${input}' -> '${output}'`, () => {
      // Parsing line with '|'-characters to the {text, selStart, selEnd}
      // One '|' means the cursor position, two '|'s means the selection start/end.
      const parts = input.split('|', 3);
      expect(parts.length, 'to be within', 2, 3);
      const selStart = parts[0].length;
      const selEnd = parts.length === 2 ? selStart : selStart + parts[1].length;

      const [rText, rSelStart, rSelEnd] = insertText('@mention', parts.join(''), selStart, selEnd);

      // Creating line with '|'-characters from the result
      const result =
        rSelStart === rSelEnd
          ? `${rText.slice(0, rSelStart)}|${rText.slice(rSelStart)}`
          : `${rText.slice(0, rSelStart)}|${rText.slice(rSelStart, rSelEnd)}|${rText.slice(rSelEnd)}`; // prettier-ignore

      expect(result, 'to be', output);
    });
  });
});
