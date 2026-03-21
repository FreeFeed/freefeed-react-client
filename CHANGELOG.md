# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.146.0] - Not released
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
