import { describe, it } from 'mocha';
import expect from 'unexpected';
import { Link as TLink } from 'social-text-tokenizer';

import { Link } from '../../../src/utils/parse-text';


const localDomains = ['freefeed.net', 'omega.freefeed.net'];

describe('parse-text', () => {
  describe('Link class', () => {
    it('should has thruthy isLocal property for local link', () => {
      const link = new Link(new TLink(0, 'https://freefeed.net/some/path'), localDomains);
      expect(link.isLocal, 'to be true');
      expect(link.localURI, 'to be', '/some/path');
    });

    it('should has thruthy isLocal property for local link with mixed-case URL', () => {
      const link = new Link(new TLink(0, 'hTTps://FreeFeed.net/some/path'), localDomains);
      expect(link.isLocal, 'to be true');
      expect(link.localURI, 'to be', '/some/path');
    });

    it('should has falsy isLocal property for remote link', () => {
      const link = new Link(new TLink(0, 'https://github.com/FreeFeed'), localDomains);
      expect(link.isLocal, 'to be false');
      expect(link.localURI, 'to be', '/FreeFeed');
    });

    it('should has thruthy isLocal property for link to the root of main domain', () => {
      const link = new Link(new TLink(0, 'https://freefeed.net'), localDomains);
      expect(link.isLocal, 'to be true');
      expect(link.localURI, 'to be', '/');
    });

    it('should has falsy isLocal property for link to the root of alternative domain', () => {
      const link = new Link(new TLink(0, 'https://omega.freefeed.net'), localDomains);
      expect(link.isLocal, 'to be false');
    });

    it('should has thruthy isLocal property for link to the non-root of alternative domain', () => {
      const link = new Link(new TLink(0, 'https://omega.freefeed.net/hello'), localDomains);
      expect(link.isLocal, 'to be true');
      expect(link.localURI, 'to be', '/hello');
    });
  });
});
