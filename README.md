# Usage

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client?ref=badge_shield)

[Node.js](https://nodejs.org) 14 or 16 is supported.

We use [yarn](https://yarnpkg.com/) as dependency manager (instead of npm) so you need to install it and run `yarn` after downloading this code. If you're using Windows, you should install developer tools by using `npm install --global --production windows-build-tools` from an elevated PowerShell or CMD.exe (run as Administrator).

## Starting Development Server with Hot-Reload

Run `yarn start`. By default it will use our staging backend [candy.freefeed.net](https://candy.freefeed.net).

Alternatively, you can install [freefeed-server](https://github.com/FreeFeed/freefeed-server) and create `config.json` file with URL of local backend:
```
{
  "api": {
    "root": "http://localhost:3000"
  }
}
```

You can also override any other configuration values. See [config/README.md](config/README.md) for details.

## Sanity checks

1. `yarn test` will build test-suite and run the tests
1. `yarn lint` will check if source code complies to the coding guidelines

## Build a production version

1. `yarn build-prod` will build a production version in the `_dist` folder

## Pre-commit hooks

We use pre-commit hook which fixes code-style. In case you want to disable it (because your IDE does this already, for
example) you can create an empty `.no_husky` file in the root directory of project.

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client?ref=badge_large)
