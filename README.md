# Usage

## Starting Development Server with Hot-Reload

Run `yarn start` (will use [staging backend](https://candy.freefeed.net)).

Alternatively, install [freefeed-server](https://github.com/FreeFeed/freefeed-server) and run `yarn dev-server:local` if you need to work with local backend.

## Sanity checks

1. `yarn test` will build test-suite and run the tests
1. `yarn lint` will check if sourcecode complies to the coding guidelines

## To deploy run

1. `make prod` or `winmake.cmd prod` on Windows
