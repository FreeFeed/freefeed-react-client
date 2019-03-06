import { describe, it } from 'mocha';
import expect from 'unexpected';
import { Link as TLink } from 'social-text-tokenizer';

import { Link } from '../../../src/utils/parse-text';


describe('parse-text', () => {
  describe('Link class', () => {
    it('should has thruthy isLocal property for local link', () => {
      const link = new Link(new TLink(0, 'https://freefeed.net/some/path'));
      expect(link.isLocal, 'to be true');
      expect(link.localURI, 'to be', '/some/path');
    });

    it('should has thruthy isLocal property for local link with mixed-case URL', () => {
      const link = new Link(new TLink(0, 'hTTps://FreeFeed.net/some/path'));
      expect(link.isLocal, 'to be true');
      expect(link.localURI, 'to be', '/some/path');
    });

    it('should has falsy isLocal property for remote link', () => {
      const link = new Link(new TLink(0, 'https://github.com/FreeFeed'));
      expect(link.isLocal, 'to be false');
      expect(link.localURI, 'to be', '/FreeFeed');
    });
  });
});
