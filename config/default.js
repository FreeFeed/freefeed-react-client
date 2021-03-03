import { DISPLAYNAMES_BOTH } from '../src/utils/frontend-preferences-options';
import { ACTIVITY, HOMEFEED_MODE_CLASSIC } from '../src/utils/feed-options';
import { TLDs } from './lib/tlds';

export default {
  api: {
    root: 'https://candy.freefeed.net',
  },

  siteTitle: 'FreeFeed',

  siteOrigin: 'http://localhost:3333',

  auth: {
    tokenPrefix: 'freefeed_',
    userStorageKey: 'USER_KEY',
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

  textFormatter: { tldList: TLDs },

  sentry: {
    publicDSN: null,
  },

  frontendPreferences: {
    clientId: 'net.freefeed',
    // Use only plain JSON types here. Do not use null values (for type checking).
    defaultValues: {
      displayNames: {
        displayOption: DISPLAYNAMES_BOTH,
        useYou: true,
      },
      realtimeActive: false,
      comments: {
        omitRepeatedBubbles: true,
        highlightComments: true,
        showTimestamps: false,
      },
      allowLinksPreview: false,
      readMoreStyle: 'modern',
      homeFeedSort: ACTIVITY,
      homeFeedMode: HOMEFEED_MODE_CLASSIC,
      homefeed: { hideUsers: [] },
      pinnedGroups: [],
      hideUnreadNotifications: false,
      timeDisplay: {
        absolute: false,
        amPm: false,
      },
    },
  },

  appearance: {
    colorSchemeStorageKey: 'color-scheme',
    nsfwVisibilityStorageKey: 'show-nsfw',
  },

  commentsFolding: {
    // Show a maximum of two comments after the fold
    afterFold: 2,
    // Show 'collapse' button when there are 12 or more comments
    minToCollapse: 12,
    // A minimum number of omitted comments (server-side constant)
    minFolded: 3,
  },

  registrationsLimit: {
    emailFormIframeSrc: null,
  },

  analytics: {
    google: null,
  },

  betaChannel: {
    // Set to true to enable 'Use the beta version' switcher in settings
    enabled: false,
    // Is the current instance is a beta instance?
    isBeta: false,
    subHeading: 'Beta',
    cookieName: 'beta_channel',
    cookieValue: '1',
  },

  eslint: {
    // By default the eslint-linebreak-style directive requires "windows" linebreaks
    // on Windows platform and "unix" linebreaks otherwise.
    // You can override this behavior by setting this parameter explicitly
    // to "windows" or "unix".
    linebreakStyle: null,
  },

  maxLength: {
    post: 3000,
    comment: 3000,
    description: 1500,
  },

  minPasswordLength: 9,
};
