import { describe, it } from 'vitest';
import expect from 'unexpected';

import { getFirstLinkToEmbed, isLocalLink, redditLinkHref } from '../../../src/utils/parse-text';

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

    it('should not return links inside spoilders', () => {
      expect(
        getFirstLinkToEmbed('abc <spoiler>https://link1.com</spoiler> https://link2.com def'),
        'to be',
        'https://link2.com/',
      );
    });
  });
});
