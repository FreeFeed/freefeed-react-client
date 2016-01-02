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
    userNameMode: 'user',
    sentinel: null // keep always last
  },
  captcha: {
    siteKey: '',
    sentinel: null // keep always last
  }
}

export default config
