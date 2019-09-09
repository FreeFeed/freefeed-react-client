/* global WEBPACK_SAYS_USE_CANDY */
import * as FrontendPrefsOptions from './utils/frontend-preferences-options';
import * as FeedOptions from './utils/feed-options';


const shouldUseCandy = typeof WEBPACK_SAYS_USE_CANDY !== 'undefined' && WEBPACK_SAYS_USE_CANDY;
const HOST = shouldUseCandy ? 'https://candy.freefeed.net' : 'http://localhost:3000';
const COOKIE_DOMAIN = shouldUseCandy ? 'candy.freefeed.net' : 'localhost';

const config = {
  api: {
    host:     HOST,
    sentinel: null // keep always last
  },
  auth: {
    cookieDomain:   COOKIE_DOMAIN,
    tokenPrefix:    'freefeed_',
    userStorageKey: 'USER_KEY',
    sentinel:       null // keep always last
  },
  captcha: {
    siteKey:  '',
    sentinel: null // keep always last
  },
  search: {
    searchEngine: null,
    sentinel:     null // keep always last
  },
  siteDomains: [ // for transform links in the posts, comments, etc.
    'freefeed.net',
    'gamma.freefeed.net'
  ],
  attachments:   { maxCount: 20 },
  textFormatter: { tldList: ['рф', 'com', 'net', 'org', 'edu', 'place'] },
  sentry:        {
    publicDSN: null,
    sentinel:  null // keep always last
  },
  frontendPreferences: {
    clientId:      'net.freefeed',
    defaultValues: {
      displayNames: {
        displayOption: FrontendPrefsOptions.DISPLAYNAMES_BOTH,
        useYou:        true
      },
      realtimeActive: false,
      comments:       {
        omitRepeatedBubbles: true,
        highlightComments:   true,
        hiddenTypes:         []
      },
      allowLinksPreview: false,
      readMoreStyle:     'modern',
      homeFeedSort:      FeedOptions.ACTIVITY,
      homeFeedMode:      FeedOptions.HOMEFEED_MODE_CLASSIC,
      homefeed:          { hideUsers: [] },
    }
  },
  appearance: { colorSchemeStorageKey: 'color-scheme' }
};

export default config;
