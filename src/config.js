import * as FrontendPrefsOptions from './utils/frontend-preferences-options';


const config = {
  api: {
    host:     'http://localhost:3000',
    sentinel: null // keep always last
  },
  auth: {
    cookieDomain:   'localhost',
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
  sentry: {
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
      homefeed:          { hideUsers: [] }
    }
  }
};

export default config;
