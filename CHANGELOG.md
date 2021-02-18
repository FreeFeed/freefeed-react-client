# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.94.0] - Not released
### Fixed
- Tiktok previews work for videos with empty title

### Changed
- Optimized build results: split code in smaller js-bundles, pre-compress js/css files
- Raised maximum length of posts and comments to 3000 chars
- Raised minimum password length to 9 chars

## [1.93.1] - 2021-01-29
### Fixed
- Move "fold comments" label above the readmore

### Changed
- Tweaked russian-language text for welcome screen

### Removed
- Removed Auth token reissue and inter-tab synchronization logic

## [1.93.0] - 2021-01-27
### Added
- Added some ARIA-roles markup

### Changed
- Changed the authorization tokens reissue algorithm. Now any tab can reissue
  tokens. Tabs uses locking for conflict protection and listens for the token
  changes from the other tabs.

## [1.92.1] - 2021-01-24
### Fixed
- Avoid breaking lines in stats of private users
- Fix errors when signing out from some of sub-pages of settings

## [1.92.0] - 2021-01-24
### Fixed
- A tall Embedly previews now folded to a reasonable height
- Created subscription requests are now visible at 'Requests' page without full
  page reload.
- Fix profile head layout in narrow screens
- Prevent statlinks from wrapping on narrow screens
- Avoid showing "edit list" control for anonymous users
- Remove ellipsis on narrow screens on group header

### Changed
- Improved english text on welcome screen

## [1.91.0] - 2021-01-15
### Fixed
- Text is properly selectable (select, copy, paste) even if it has spoiler-tags in it
- Selecting text does not reveal spoiler contents on Windows
- Improve auto-direction support in text inputs (useful for right-to-left languages)
- Load external css-files after inline styles. Otherwise, rules priority was broken
- Prevent display of link previews from inside spoilers
- Focus is removed from post textarea after posting
- Fix highlight color of expand-panel
- Fix YouTube previews
### Added
- Use open-source Vazir font to display Persian letters
- New authorization sessions support. User is now able to view and manage
  (close) their authorization sessions on the special settings page.
- User's stats block (on her feed-page) has "All posts" link now
- "All Groups" page can be filtered now
- "Spoiler" texts can be hidden by clicking on them

## [1.90.1] - 2020-12-30
### Fixed
- Restored accidentally deleted "Browse" word from sidebar

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
