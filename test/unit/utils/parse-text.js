import { describe, it } from 'vitest';
import expect from 'unexpected';

import { makeToken } from 'social-text-tokenizer/utils';
import {
  getFirstLinkToEmbed,
  isLocalLink,
  redditLinkHref,
  CODE_INLINE,
  codeInline,
  parseText,
  codeBlocks,
  CODE_BLOCK,
} from '../../../src/utils/parse-text';

const localDomains = ['freefeed.net', 'omega.freefeed.net'];

describe('parse-text', () => {
  describe('isLocalLink', () => {
    const testData = [
      { url: 'https://freefeed.net/some/path', result: true },
      { url: 'hTTps://FreeFeed.net/some/path', result: true },
      { url: 'https://github.com/FreeFeed', result: false },
      { url: 'https://freefeed.net', result: true },
      { url: 'https://omega.freefeed.net', result: false },
      { url: 'https://omega.freefeed.net/', result: false },
      { url: 'https://omega.freefeed.net/hello', result: true },
    ];

    for (const { url, result } of testData) {
      it(`should detect the ${result ? 'local' : 'remote'} link ${JSON.stringify(url)}`, () => {
        expect(isLocalLink(url, localDomains), 'to be', result);
      });
    }
  });

  describe('redditLinkHref', () => {
    const testData = [
      { text: 'r/foo', result: 'https://www.reddit.com/r/foo' },
      { text: '/r/bar', result: 'https://www.reddit.com/r/bar' },
    ];

    for (const { text, result } of testData) {
      it(`should has correct href for Reddit link ${JSON.stringify(text)}`, () => {
        expect(redditLinkHref(text), 'to be', result);
      });
    }
  });

  describe('Get first link to embed', () => {
    it('should return undefined for no links', () => {
      expect(getFirstLinkToEmbed('abc def'), 'to be undefined');
    });

    it('should return first link out of many', () => {
      expect(
        getFirstLinkToEmbed('abc https://link1.com https://link2.com def'),
        'to be',
        'https://link1.com/',
      );
    });

    it('should return first non-excluded link', () => {
      expect(
        getFirstLinkToEmbed('abc !https://link1.com https://link2.com def'),
        'to be',
        'https://link2.com/',
      );
    });

    it('should not return links inside spoilers', () => {
      expect(
        getFirstLinkToEmbed('abc <spoiler>https://link1.com</spoiler> https://link2.com def'),
        'to be',
        'https://link2.com/',
      );
    });
  });

  describe('codeInline tokenizer', () => {
    it('should decode inline code in single backticks surrounded by spaces/punctuation or text start/end', () => {
      const testData = [
        {
          text: '`code`',
          found: [{ code: '`code`', offset: 0 }],
        },
        {
          text: '``code``',
          found: [{ code: '``code``', offset: 0 }],
        },
        {
          text: '` `',
          found: [{ code: '` `', offset: 0 }],
        },
        {
          text: 'here it is: `foo()` - an example of function call in JS',
          found: [{ code: '`foo()`', offset: 12 }],
        },
        {
          text: '`foo()` is an example of function call in JS',
          found: [{ code: '`foo()`', offset: 0 }],
        },
        {
          text: 'here is an example of function call in JS: `foo()`',
          found: [{ code: '`foo()`', offset: 43 }],
        },
        {
          text: 'here it is: `foo()   `-an example of function call in JS',
          found: [{ code: '`foo()   `', offset: 12 }],
        },
        {
          text: 'here is an example of function call in JS >`\tfoo()`!',
          found: [{ code: '`\tfoo()`', offset: 43 }],
        },
        {
          text: `
here is the list of function calls:
- \`foo()\`;
\t\`bar()\`,
-\`baz()\`.
`,
          found: [
            { code: '`foo()`', offset: 39 },
            { code: '`bar()`', offset: 49 },
            { code: '`baz()`', offset: 59 },
          ],
        },
        {
          text: '(`code`)',
          found: [{ code: '`code`', offset: 1 }],
        },
        {
          text: '[`code`]',
          found: [{ code: '`code`', offset: 1 }],
        },
        {
          text: '{`code`}',
          found: [{ code: '`code`', offset: 1 }],
        },
        {
          text: '`code\\` text`',
          found: [{ code: '`code\\`', offset: 0 }],
        },
        {
          text: '`code; \n code;` text',
          found: [{ code: '`code; \n code;`', offset: 0 }],
        },
        {
          text: '``code; \n code;`` text',
          found: [{ code: '``code; \n code;``', offset: 0 }],
        },
      ];

      for (const { text, found } of testData) {
        expect(
          codeInline(text),
          'to equal',
          found.map(({ code, offset }) => ({
            type: CODE_INLINE,
            offset,
            text: code,
          })),
        );
      }
    });

    it('should not decode regular text without backticks as inline code', () => {
      expect(codeInline('there is no code here'), 'to be empty');
    });

    it('should not decode inline code in single backticks not surrounded by spaces/punctuation or text start/end', () => {
      const testData = [
        'here it is`foo()` - is not a correct inline code',
        '#`foo()` is not a correct example of inline code',
        'here is not a correct example of inline code`foo()`',
        `
here is the list of incorrect examples of inline codes:
1\`foo()\`;
b\`bar()\`,
III\`baz()\`.
@\`bazar()\`.
`,
      ];

      for (const text of testData) {
        expect(codeInline(text), 'to be empty');
      }
    });

    it('should not decode empty inline code', () => {
      expect(codeInline('there is no code >``< here'), 'to be empty');
    });

    it('should not decode unbalanced backticks', () => {
      const testData = ['not-a`code', 'not a co`de, a`nd this one`'];

      for (const text of testData) {
        expect(codeInline(text), 'to be empty');
      }
    });

    it('should not decode single backticks inside of inline code surrounded by backticks', () => {
      expect(codeInline('`single backtick ` inside code should not be decoded`'), 'to equal', [
        {
          type: CODE_INLINE,
          offset: 0,
          text: '`single backtick `',
        },
      ]);
    });

    it('should decode single backticks inside of inline code surrounded by double backticks', () => {
      expect(codeInline('``single backtick ` inside code should be decoded``'), 'to equal', [
        {
          type: CODE_INLINE,
          offset: 0,
          text: '``single backtick ` inside code should be decoded``',
        },
      ]);
    });

    it('should not decode nested inline code', () => {
      expect(codeInline('`inline code should not have ` nested ` code blocks`'), 'to equal', [
        {
          type: CODE_INLINE,
          offset: 0,
          text: '`inline code should not have `',
        },
        {
          type: CODE_INLINE,
          offset: 38,
          text: '` code blocks`',
        },
      ]);
    });

    it('should decode nested inline code inside of double backticks', () => {
      expect(
        codeInline('``inline code in double backticks can have ` nested ` code blocks``'),
        'to equal',
        [
          {
            type: CODE_INLINE,
            offset: 0,
            text: '``inline code in double backticks can have ` nested ` code blocks``',
          },
        ],
      );
    });
  });

  describe('codeBlocks tokenizer', () => {
    const t = makeToken(CODE_BLOCK);
    // prettier-ignore
    const testData = [
      { text: '```\nfoo()\n```', found: [t(0, '```\nfoo()\n```')] },
      { text: 'code:\n```\nfoo()\n```\nand text', found: [t(6, '```\nfoo()\n```')] },
      { text: ' ```js\nfoo()\n ```  ', found: [t(1, '```js\nfoo()\n ```')] },
      { text: ' ``` js and more \nfoo()\n ```  ', found: [t(1, '``` js and more \nfoo()\n ```')] },
      { text: 'text ```js\nfoo()\n ```  ', found: [] },
      { text: '```js\nfoo()\n ``` tail', found: [] },
      // Two backticks
      { text: '``\nfoo()\n``', found: [] },
      // Unbalanced backticks
      { text: '```\nfoo()\n````', found: [] },
      { text: '````\nfoo()\n````', found: [t(0, '````\nfoo()\n````')] },
      // Code blocks inside code blocks
      { text: '````\n```\nfoo()\n```\n````', found: [t(0, '````\n```\nfoo()\n```\n````')] },
      { text: '```\n````\nfoo()\n````\n```', found: [t(0, '```\n````\nfoo()\n````\n```')] },
      // Empty code block
      { text: '```\n```', found: [t(0, '```\n```')] },
      // Two code blocks
      { text: '```\nfoo()\n```\n```\\bar()\n```\n', found: [t(0, '```\nfoo()\n```'), t(14, '```\\bar()\n```')] },
      // Unfinished code block
      { text: '```\nfoo()\n```\n\\bar()\n```\n', found: [t(0, '```\nfoo()\n```')] },
    ];
    for (const { text, found } of testData) {
      it(`should decode ${JSON.stringify(text)}`, () => {
        expect(codeBlocks(text), 'to equal', found);
      });
    }
  });

  describe('parseText tokenizer', () => {
    const inlineCodeToken = (text, offset = 0) => ({
      type: CODE_INLINE,
      offset,
      text,
    });

    const codeBlockToken = (text, offset = 0) => ({
      type: CODE_BLOCK,
      offset,
      text,
    });

    describe('inline code checks', () => {
      it('should not decode mentions in inline code', () => {
        expect(parseText('`inline code @mention qwerty`'), 'to equal', [
          inlineCodeToken('`inline code @mention qwerty`'),
        ]);
      });

      it('should not decode emails in inline code', () => {
        expect(parseText('`user@example.com`'), 'to equal', [
          inlineCodeToken('`user@example.com`'),
        ]);
      });

      it('should not decode hashtags in inline code', () => {
        expect(parseText('`#hashtag`'), 'to equal', [inlineCodeToken('`#hashtag`')]);
      });

      it('should not decode arrows in inline code', () => {
        expect(parseText('text `^ code ^`'), 'to equal', [
          {
            type: 'TEXT',
            offset: 0,
            text: 'text ',
          },
          inlineCodeToken('`^ code ^`', 5),
        ]);
      });

      it('should not decode links in inline code', () => {
        expect(parseText('`https://example.com`'), 'to equal', [
          inlineCodeToken('`https://example.com`'),
        ]);
      });

      it('should not decode foreign mentions in inline code', () => {
        expect(parseText('`alice@tg`'), 'to equal', [inlineCodeToken('`alice@tg`')]);
      });

      it('should not decode line breaks in inline code', () => {
        const multiline = '`\nmulti\nline\ninline\ncode\n`';
        expect(parseText(multiline), 'to equal', [inlineCodeToken(multiline)]);
      });

      it('should not decode paragraph breaks in inline code', () => {
        const multiline = `\`
  multi



  line\``;
        expect(parseText(multiline), 'to equal', [inlineCodeToken(multiline)]);
      });

      it('should not decode spoilers in inline code', () => {
        expect(parseText('`<spoiler>code</spoiler>`'), 'to equal', [
          inlineCodeToken('`<spoiler>code</spoiler>`'),
        ]);
      });

      it('should not decode spoilers intersecting with inline code', () => {
        expect(parseText('` <spoiler> code ` </spoiler>'), 'to equal', [
          inlineCodeToken('` <spoiler> code `'),
          {
            type: 'TEXT',
            offset: 18,
            text: ' </spoiler>',
          },
        ]);
      });
    });

    describe('code block checks', () => {
      it('should not decode mentions in code blocks', () => {
        expect(parseText('```\ncode block @mention qwerty\n```'), 'to equal', [
          codeBlockToken('```\ncode block @mention qwerty\n```'),
        ]);
      });

      it('should not decode emails in code blocks', () => {
        expect(parseText('```\nuser@example.com\n```'), 'to equal', [
          codeBlockToken('```\nuser@example.com\n```'),
        ]);
      });

      it('should not decode hashtags in code blocks', () => {
        expect(parseText('```\n#hashtag\n```'), 'to equal', [codeBlockToken('```\n#hashtag\n```')]);
      });

      it('should not decode arrows in code blocks', () => {
        expect(parseText('text\n```\n^ code ^\n```'), 'to equal', [
          { type: 'TEXT', offset: 0, text: 'text' },
          { type: 'LINE_BREAK', offset: 4, text: '\n' },
          codeBlockToken('```\n^ code ^\n```', 5),
        ]);
      });

      it('should not decode links in code blocks', () => {
        expect(parseText('```\nhttps://example.com\n```'), 'to equal', [
          codeBlockToken('```\nhttps://example.com\n```'),
        ]);
      });

      it('should not decode foreign mentions in code blocks', () => {
        expect(parseText('```\nalice@tg\n```'), 'to equal', [codeBlockToken('```\nalice@tg\n```')]);
      });

      it('should not decode line breaks in code blocks', () => {
        const multiline = '```\nmulti\nline\ncode\nblock\n```';
        expect(parseText(multiline), 'to equal', [codeBlockToken(multiline)]);
      });

      it('should not decode paragraph breaks in code blocks', () => {
        const multiline = `\`\`\`
  multi



  line
  \`\`\``;
        expect(parseText(multiline), 'to equal', [codeBlockToken(multiline)]);
      });

      it('should not decode spoilers in code blocks', () => {
        expect(parseText('```\n<spoiler>code</spoiler>\n```'), 'to equal', [
          codeBlockToken('```\n<spoiler>code</spoiler>\n```'),
        ]);
      });

      it('should not decode spoilers intersecting with code blocks', () => {
        expect(parseText('```\n<spoiler> code\n```\n</spoiler>'), 'to equal', [
          codeBlockToken('```\n<spoiler> code\n```'),
          { type: 'LINE_BREAK', offset: 22, text: '\n' },
          { type: 'TEXT', offset: 23, text: '</spoiler>' },
        ]);
      });

      it('should not decode inline code in code blocks', () => {
        const codeBlock = '```\ncode line 1;\n`inline code`;\ncode line 2;\n```';
        expect(parseText(codeBlock), 'to equal', [codeBlockToken(codeBlock)]);
      });
    });
  });
});
