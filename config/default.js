import { DISPLAYNAMES_BOTH } from '../src/utils/frontend-preferences-options';
import { ACTIVITY, HOMEFEED_MODE_CLASSIC } from '../src/utils/feed-options';

/**
 * We use this old-fashioned style of export because the 'config'
 * module is not understand the ES6 default export properly.
 *
 * See https://github.com/lorenwest/node-config/issues/521
 */
module.exports = {
  api: {
    root: 'https://candy.freefeed.net',
  },

  siteOrigin: 'http://localhost:3333',

  auth: {
    tokenPrefix: 'freefeed_',
    userStorageKey: 'USER_KEY',
    /**
     * Array of enabled identity providers (e.g. ['facebook', 'google'])
     * or empty array if no providers are supported.
     */
    extAuthProviders: ['facebook', 'google'],
  },

  captcha: {
    siteKey: '',
  },

  search: {
    searchEngine: null,
  },

  siteDomains: [
    // for transform links in the posts, comments, etc.
    'freefeed.net',
    'gamma.freefeed.net',
  ],

  attachments: { maxCount: 20 },

  textFormatter: { tldList: ['рф', 'com', 'net', 'org', 'edu', 'place'] },

  sentry: {
    publicDSN: null,
  },

  frontendPreferences: {
    clientId: 'net.freefeed',
    defaultValues: {
      displayNames: {
        displayOption: DISPLAYNAMES_BOTH,
        useYou: true,
      },
      realtimeActive: false,
      comments: {
        omitRepeatedBubbles: true,
        highlightComments: true,
      },
      allowLinksPreview: false,
      readMoreStyle: 'modern',
      homeFeedSort: ACTIVITY,
      homeFeedMode: HOMEFEED_MODE_CLASSIC,
      homefeed: { hideUsers: [] },
      pinnedGroups: [],
      hideUnreadNotifications: false,
    },
  },

  appearance: { colorSchemeStorageKey: 'color-scheme' },

  registrationsLimit: {
    emailFormIframeSrc: null,
  },

  eslint: {
    // By default the eslint-linebreak-style directive requires "windows" linebreaks
    // on Windows platform and "unix" linebreaks otherwise.
    // You can override this behavior by setting this parameter explicitly
    // to "windows" or "unix".
    linebreakStyle: null,
  },
};
