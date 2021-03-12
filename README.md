# Usage

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client?ref=badge_shield)

We use [yarn](https://yarnpkg.com/) as dependency manager (instead of npm) so you need to install it and run `yarn` after downloading this code. If you're using Windows, you should install developer tools by using `npm install --global --production windows-build-tools` from an elevated PowerShell or CMD.exe (run as Administrator).

## Starting Development Server with Hot-Reload

Run `yarn start`. By default it will use our staging backend [candy.freefeed.net](https://candy.freefeed.net).

Alternatively, you can install [freefeed-server](https://github.com/FreeFeed/freefeed-server) and create `config.json` file in the project root with URL of local backend:
```
{
  "api": {
    "root": "http://localhost:3000"
  }
}
```

You can also use custom local configuration file or additional environment variables to override default settings. FreeFeed uses the [config](https://github.com/lorenwest/node-config) npm module to manage the configuration. Please read it documentation to learn how add custom settings.

## Sanity checks

1. `yarn test` will build test-suite and run the tests
1. `yarn lint` will check if sourcecode complies to the coding guidelines

## Build a production version

1. `yarn build-prod` will build a production version in the `_dist` folder

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FFreeFeed%2Ffreefeed-react-client?ref=badge_large)
