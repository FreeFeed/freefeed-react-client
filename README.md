# Usage

We use [yarn](https://yarnpkg.com/) as dependency manager (instead of npm) so you need to install it and run `yarn` after downloading this code.

## Starting Development Server with Hot-Reload

Run `yarn start` (will use [staging backend](https://candy.freefeed.net)).

Alternatively, install [freefeed-server](https://github.com/FreeFeed/freefeed-server) and set the `FRF_API_ROOT` environment variable if you need to work with local backend.

You can also use the `.env` file to override default settings (see [.env.defaults](./.env.defaults) file for more details).

## Sanity checks

1. `yarn test` will build test-suite and run the tests
1. `yarn lint` will check if sourcecode complies to the coding guidelines

## To deploy run

1. `yarn build-prod`
