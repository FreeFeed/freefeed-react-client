# Changelog 2025

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.143.0] - 2025-12-17
### Added
- Hashtag autocomplete in post and comment editors. Start typing `#` followed by
  letters to see matching hashtags from your posts and other users' posts.
  Supports non-Latin characters in hashtags.

## [1.142.0] - 2025-11-30
### Added
- Show found users and groups on the search results page.
- Show previews of media links in comments (disabled by default). Supported link
  types: FreeFeed images and videos, external images, YouTube videos and shorts.

## [1.141.3] - 2025-10-28
### Fixed
- Preserve query parameters and hash when initializing browser history.

## [1.141.0] - 2025-09-22
### Changed
- Migrate to React 19.
- Migrate to ESLint 9 with flat config.
- Split giant middlewares file into smaller files.

## [1.140.2] - 2025-09-20
### Fixed
- The sidebar no longer closes when clicking on group links in the "Recent
  Groups" panel.
- The user info pop-up in the sidebar now closes when the user clicks on a link
  within it or when the pop-up anchor is moved out of the viewport.

## [1.140.0] - 2025-09-12
### Added
- Pinning posts feature. Users can now pin/unpin posts at the top of their own
  feed or the feed of a group they administer.
- Youtube Live links preview
- Information pop-ups on the links in the "Recent Groups" panel. The "Pin" and
  "Un-Pin" buttons have been added to these pop-ups.
### Changed
- The 'react-router' was replaced by the custom router (see
  _src/services/nouter/_). It supports all features of the original react-router
  v3 we needed and is compatible with the modern React.

## [1.139.2] - 2025-08-04
### Added
- Quick Links (TOC) on the Appearance tab of the Settings page.
- New setting: "Align RTL post bodies and user descriptions to the right"
  (enabled by default).

## [1.139.0] - 2025-08-02
### Changed
- The RTL texts of post body and user's self-description are now right-aligned.
- It is now possible to save the image in portable formats using the “Save image
  as...” browser menu. The saving version is an original for JPEG/PNG/GIF
  original image or a big JPEG preview for other formats.
- Use version text check instead of service worker on iOS and desktop Safari.
### Fixed
- The "Download" button in the lightbox was not displayed if the browser did not
  support the full-screen API.
- Prevent page scroll on lightbox opening (bug sometimes occurred in mobile and
  desktop Firefox).
## [1.138.1] - 2025-07-09
### Fixed
- Set the proper "theme-color" meta tag in the startup script (i.e. as earlier
  as possible).

## [1.138.0] - 2025-07-02
### Added
- Undo support: client now understands the new 'undo' server API and allows undo
  deletion of posts and comments.
### Fixed
- Fixed invalid insertion of autocomplete when there is a text after the cursor.

## [1.137.4] - 2025-04-01
### Changed
- Every playable attachment preview now has a "Play" icon on it.
- The "!" character before the link now turns off any kind of link processing,
  including the lightbox or the link preview.

## [1.137.2] - 2025-03-15
### Changed
- The "Download" button in the lightbox now actually downloads the image/video
  (i.e. points to the URL with the 'download' attribute).

## [1.137.0] - 2025-03-07
### Changed
- Totally new design of post attachments, including larger previews and denser
  gallery layout.
- Support for video attachments, asynchronous media processing and the V4 server
  API.
### Fixed
- File uploader now properly displays the upload progress.
- Updated all SASS imports according to upcoming changes in Dart Sass:
  https://sass-lang.com/documentation/breaking-changes/import/

## [1.136.3] - 2025-01-05
### Changed
- We now use the our own CORS proxy when showing the link previews for Coub,
  Giphy and Aparat services.
