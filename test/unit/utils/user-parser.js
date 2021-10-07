import { describe, it } from 'mocha';
import expect from 'unexpected';

import { userParserFull } from '../../../src/utils';

describe('userParserFull', () => {
  describe('User without frontendPreferences', () => {
    it('should parse user info without userpics', () => {
      const user = {};
      const newUser = userParserFull(user, {}, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'foo',
        profilePictureLargeUrl: 'foo',
      });
    });

    it('should parse user info with empty userpics', () => {
      const user = {
        profilePictureMediumUrl: '',
        profilePictureLargeUrl: '',
      };
      const newUser = userParserFull(user, {}, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'foo',
        profilePictureLargeUrl: 'foo',
      });
    });

    it('should parse user info with non-empty userpics', () => {
      const user = {
        profilePictureMediumUrl: 'bar',
        profilePictureLargeUrl: 'bar',
      };
      const newUser = userParserFull(user, {}, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'bar',
        profilePictureLargeUrl: 'bar',
      });
    });
  });

  describe('User with frontendPreferences', () => {
    const clientId = 'omega';
    const confPrefs = {
      defaultValues: {
        foo: 'bar',
        bar: 'baz',
      },
      defaultOverrides: {
        foo: { createdSince: '2021-10-01', value: 'rab' },
        bar: { createdBefore: '2021-08-01', value: 'zab' },
      },
      clientId,
    };

    it('should parse user info with empty prefs', () => {
      const user = { frontendPreferences: {} };
      const newUser = userParserFull(user, confPrefs, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'foo',
        profilePictureLargeUrl: 'foo',
        frontendPreferences: confPrefs.defaultValues,
      });
    });

    it('should parse user info with some prefs', () => {
      const user = { frontendPreferences: { [clientId]: { foo: 'BAAR' } } };
      const newUser = userParserFull(user, confPrefs, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'foo',
        profilePictureLargeUrl: 'foo',
        frontendPreferences: { ...confPrefs.defaultValues, foo: 'BAAR' },
      });
    });

    it('should parse user info without defaults override', () => {
      const user = {
        // Created after 'createdBefore' but before 'createdSince' date
        createdAt: new Date('2021-09-01').getTime().toString(10),
        frontendPreferences: {},
      };
      const newUser = userParserFull(user, confPrefs, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'foo',
        profilePictureLargeUrl: 'foo',
        createdAt: user.createdAt,
        frontendPreferences: { ...confPrefs.defaultValues },
      });
    });

    it('should parse user info with defaults override (createdBefore)', () => {
      const user = {
        // Created before 'createdBefore' date
        createdAt: new Date('2021-07-01').getTime().toString(10),
        frontendPreferences: {},
      };
      const newUser = userParserFull(user, confPrefs, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'foo',
        profilePictureLargeUrl: 'foo',
        createdAt: user.createdAt,
        frontendPreferences: { ...confPrefs.defaultValues, bar: 'zab' },
      });
    });

    it('should parse user info with defaults override (createdSince)', () => {
      const user = {
        // Created after 'createdSince' date
        createdAt: new Date('2021-10-01').getTime().toString(10),
        frontendPreferences: {},
      };
      const newUser = userParserFull(user, confPrefs, 'foo');
      expect(newUser, 'not to be', user);
      expect(newUser, 'to equal', {
        profilePictureMediumUrl: 'foo',
        profilePictureLargeUrl: 'foo',
        createdAt: user.createdAt,
        frontendPreferences: { ...confPrefs.defaultValues, foo: 'rab' },
      });
    });
  });
});
