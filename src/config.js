import * as FrontendPrefsOptions from './utils/frontend-preferences-options';
import * as FeedOptions from './utils/feed-options';

const config = {
  api: {
    host: process.env.FRF_API_ROOT,
    sentinel: null, // keep always last
  },
  auth: {
    cookieDomain: process.env.FRF_COOKIE_DOMAIN,
    tokenPrefix: process.env.FRF_TOKEN_PREFIX,
    userStorageKey: process.env.FRF_USER_STORAGE_KEY,
    sentinel: null, // keep always last
  },
  captcha: {
    siteKey: process.env.FRF_CAPTCHA_SITEKEY,
    sentinel: null, // keep always last
  },
  search: {
    searchEngine: null,
    sentinel: null, // keep always last
  },
  siteDomains: [
    // for transform links in the posts, comments, etc.
    'freefeed.net',
    'gamma.freefeed.net',
  ],
  attachments: { maxCount: 20 },
  textFormatter: { tldList: ['рф', 'com', 'net', 'org', 'edu', 'place'] },
  sentry: {
    publicDSN: process.env.FRF_SENTRY_DSN || null,
    sentinel: null, // keep always last
  },
  frontendPreferences: {
    clientId: 'net.freefeed',
    defaultValues: {
      displayNames: {
        displayOption: FrontendPrefsOptions.DISPLAYNAMES_BOTH,
        useYou: true,
      },
      realtimeActive: false,
      comments: {
        omitRepeatedBubbles: true,
        highlightComments: true,
        hiddenTypes: [],
      },
      allowLinksPreview: false,
      readMoreStyle: 'modern',
      homeFeedSort: FeedOptions.ACTIVITY,
      homeFeedMode: FeedOptions.HOMEFEED_MODE_CLASSIC,
      homefeed: { hideUsers: [] },
    },
  },
  appearance: { colorSchemeStorageKey: 'color-scheme' },
};

export default config;
