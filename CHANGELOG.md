# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.90.0] - 2020-12-29
### Fixed
- Compensate the unwanted scrolling on iOS Chrome after lightbox closing.
- Prevent early close of the comment-likes list (It started to close after opening in React 17)

### Added
- Developers can use the _config.json_ file in the project root during the dev.
  server run. This file will not be included in compiled code but it is useful
  for development because config changes now doesn't require full client
  rebuild.

### Changed
- Developer server (started by `yarn start`) now listening all network
  interfaces instead of just 127.0.0.1. It helps to debug client on different
  devices in same network.
- Tweaked contrast of spoiler-tags (they're WCAG compatible now)
- Don't close clikes-panel on click inside of it (still close it on click outside)
- Wait up to 250ms after click to show fully rendered clikes panel. Show throbber if data is not ready after that 

## [1.89.3] - 2020-12-18
### Fixed
- Resolved regression (removed prematurely enabled react-17)

## [1.89.2] - 2020-12-18
### Fixed
- Prevent conflict between spoilers and 'read more'

### Added
- Link to results in Vote2020 block

## [1.89.1] - 2020-12-15
### Changed
- Use different style for "vote2020" block (thanks to @clbn)

## [1.89.0] - 2020-12-13
### Added
- A 'Not Found' page for URI's that does not match any of the site routes.
- A &lt;spoiler> tag for the sensitive or spoiler texts.
- Support for FreeFeed's Supervisory Board 2020 election

### Changed
- Applied some rendering optimisations

## [1.88.1] - 2020-11-17
### Fixed
- Show explicit error if config.json failed to load, and it wasn't 404

## [1.88.0] - 2020-11-10
### Fixed
- Embedly previews handle light/dark theme switching properly
- Home feed edition popups now closes when the Esc key is pressed or the shadow
  overlay is clicked
- Incorrect sorting of recent groups when getting real-time updates

### Changed
- Google Analytics ID isn't hardcoded in index.jade anymore.

- Client now supports arbitrary list of external identity providers that are
  available on the server.

## [1.87.1] - 2020-10-14

### Fixed

- Update version in footer

## [1.87.0] - 2020-10-13

### Added

- SoundCloud links previews
- Support of [well-known URL for changing passwords](https://w3c.github.io/webappsec-change-password-url/)
- Spotify links previews

### Fixed

- Links to the images hosted on Dropbox are now correctly displayed in a lightbox
- Improve mentions parsing

### Changed

- Cut the post links in texts after the first UUID octet block

## [1.86.0] - 2020-09-15

### Changed

- Describe new search-syntax rules
- Add support for URLs ending with asterisk

## [1.85.1] - 2020-09-11

### Fixed

- The sidebar block headers can be multiline now. It is useful for long variable phrases like “Memories of September 30”. Also, we prevent linebreaks between month and day in the Memories header.
