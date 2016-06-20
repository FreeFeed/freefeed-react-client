import * as FrontendPrefsOptions from './utils/frontend-preferences-options';

const config = {
  api:{
    host: 'http://localhost:3000',
    sentinel: null // keep always last
  },
  auth: {
    cookieDomain: 'localhost',
    tokenPrefix: 'freefeed_',
    userStorageKey: 'USER_KEY',
    sentinel: null // keep always last
  },
  captcha: {
    siteKey: '',
    sentinel: null // keep always last
  },
  search: {
    searchEngine: 'http://search.pepyatka.com/s?q=',
    sentinel: null // keep always last
  },
  siteDomains: [ // for transform links in the posts, comments, etc.
    'freefeed.net',
    'm.freefeed.net',
    'beta.freefeed.net',
    'old.freefeed.net'
  ],
  sentry: {
    publicDSN: 'https://0123456789abcdef0123456789abcdef@app.getsentry.com/12345',
    sentinel: null // keep always last
  },
  frontendPreferences: {
    clientId: 'net.freefeed',
    defaultValues: {
      displayNames: {
        displayOption: FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME,
        useYou: true
      },
      realtimeActive: false,
      comments: {
        omitRepeatedBubbles: true,
        highlightComments: true
      },
      allowLinksPreview: false
    }
  }
};

export default config;
