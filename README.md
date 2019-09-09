# Usage

## Starting Development Server with Hot-Reload

1. Start [freefeed-server](https://github.com/FreeFeed/freefeed-server)
1. `npm start` or `dev-server.cmd` on Windows

Alternatively, instead of running a local backend, edit `src/config.js` and set `api.host` to `'https://candy.freefeed.net'` and `auth.cookieDomain` to `'candy.freefeed.net'` to use data from test backend.

## Sanity checks

1. `npm test` will build test-suite and run the tests
1. `npm run lint` will check if sourcecode complies to the coding guidelines

## To deploy run

1. `make prod` or `winmake.cmd prod` on Windows
