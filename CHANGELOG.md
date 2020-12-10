# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.88.1] - Not released
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
