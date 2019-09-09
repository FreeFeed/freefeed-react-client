# Usage

## Starting Development Server with Hot-Reload

Run `npm start` (will use [staging backend](https://candy.freefeed.net)).

Alternatively, install [freefeed-server](https://github.com/FreeFeed/freefeed-server) and run `npm run dev-server:local` if you need to work with local backend.

Alternatively, instead of running a local backend, edit `src/config.js` and set `api.host` to `'https://candy.freefeed.net'` and `auth.cookieDomain` to `'candy.freefeed.net'` to use data from test backend.

## Sanity checks

1. `npm test` will build test-suite and run the tests
1. `npm run lint` will check if sourcecode complies to the coding guidelines

## To deploy run

1. `make prod` or `winmake.cmd prod` on Windows
