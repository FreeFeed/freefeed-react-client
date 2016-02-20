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
  user:{
    userNameMode: 'screen',
    sentinel: null // keep always last
  },
  captcha: {
    siteKey: '',
    sentinel: null // keep always last
  },
  siteDomains: [ // for transform links in the posts, comments, etc.
    'freefeed.net',
    'm.freefeed.net',
    'beta.freefeed.net'
  ],
  frontendPreferences: {
    clientId: 'net.freefeed'
  }
}

export default config
