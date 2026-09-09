# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.149.0] - Not released

## [1.148.5] - 2026-09-09
### Added
- Picture-in-Picture support for video attachments and embedded video link previews. 

### Changed
- PDF link previews are now static and generated via the `thum.io` service.

### Fixed
- Wikimedia Commons image previews and thumbnails display

## [1.148.2] - 2026-08-02
### Added
- Added the "Show HDR images in lightbox" setting on the Appearance
  settings page. It is enabled by default and saved locally in the browser.
- Lightbox now opens and closes with a smooth transition between SDR and
  HDR image rendering, instead of switching abruptly.

## [1.148.0] - 2026-07-30
### Added
- Support of `variant` parameter in attachment preview URLs. For now, we use `hdr` variant 
  to get high dynamic range images (if server supports it).
- Bundled [FreeFeed Flags](https://github.com/FreeFeed/freefeed-flags-font) font
  for consistent flag emoji rendering, with the Iran flag replaced by the Lion
  and Sun version.

## [1.147.1] - 2026-07-22
### Added
- Video and audio attachment players now remember their volume settings between views.

### Fixed
- Keep comment forms open when visible posts refresh after a real-time reconnection.

## [1.147.0] - 2026-06-08
### Added
- Post and comment previews for FreeFeed links. When a post contains a link to
  another FreeFeed post or a specific comment (e.g., `/username/postId` or
  `/username/postId#commentId`), the app now shows a preview with author info
  and text excerpt.

### Fixed
- Autocomplete dropdown no longer reopens immediately after selecting a suggestion.
- Trim whitespace from usernames in feeds selector.

## [1.146.1] - 2026-03-30
### Changed
- Attachment links now always show short UUID label (first 8 chars) and file icons.
- "Audio" and "general" attachment types now show file extension after the short label.

### Fixed
- Lightbox "Loading..." stuck and "Cannot set properties of null" errors.

## [1.146.0] - 2026-03-21
### Added
- "All media" page for users and groups with single gallery of all visual
  attachments from all page's posts.
- Lightbox captions on "All media" showing author avatar, username, and a post
  text excerpt with a link to the original post.
- Short labels for FreeFeed attachment links in comments using first 8
  characters of attachment UUID.

### Changed
- Improved aspect ratio display for image and video previews in comments,
  increased preview size from 4em to 6em.
- CHANGELOG is now split into yearly archive files in the [changelogs/](changelogs/)
  folder for easier navigation.

## [1.145.0] - 2026-02-21
### Added
- Automatic feed and user data refresh after reconnection. When the real-time
  connection is restored, the app now automatically reloads all visible posts
  and the current user information to ensure all data is up-to-date.

## [1.144.2] - 2026-01-31
### Changed
- Limit feed entries number to 60 (configurable via `CONFIG.feed.maxEntries`) to
  prevent the feed from growing indefinitely on long-running sessions.
### Fixed
- Prevent closing lightbox on wheel scroll if the image is zoomed in.
- Fix data parsing on Calendar pages.

## [1.144.0] - 2026-01-12
### Added
- Account pause functionality. Users can now temporarily suspend their account
  from the Settings page. Paused accounts are distinguished from deleted
  accounts in the UI.

## Older releases
See [changelogs/](changelogs/) for archived release notes.
