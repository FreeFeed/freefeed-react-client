# Usage

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client?ref=badge_shield)

We use [yarn](https://yarnpkg.com/) as dependency manager (instead of npm) so you need to install it and run `yarn` after downloading this code.

## Starting Development Server with Hot-Reload

Run `yarn start` (will use [staging backend](https://candy.freefeed.net)).

Alternatively, install [freefeed-server](https://github.com/FreeFeed/freefeed-server) and set the `FRF_API_ROOT` environment variable if you need to work with local backend.

You can also use custom local configuration file or additional environment variables to override default settings. FreeFeed uses the [config](https://github.com/lorenwest/node-config) npm module to manage the configuration. Please read it documentation to learn how add custom settings.

## Sanity checks

1. `yarn test` will build test-suite and run the tests
1. `yarn lint` will check if sourcecode complies to the coding guidelines

## Build a production version

1. `yarn build-prod` will build a production version in the `_dist` folder

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client?ref=badge_large)
