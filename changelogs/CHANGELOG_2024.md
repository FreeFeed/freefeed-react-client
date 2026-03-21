# Changelog 2024

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.136.2] - 2024-12-04
### Changed
- The autocomplete is now queries server during typing. It allows to show exact
  matches of private users and groups.

## [1.136.0] - 2024-11-08
### Changed
- The advanced search form is refactored to support the new search operators.
### Added
- When user presses '/' or 'Ctrl+K' hotkeys, the search input form in the
  header is focused.
- This form now has an "Advanced search options" button that redirects to the
  advanced search form.
### Fixed
- The post attachments now appear in the same order as they were added by user.
  Previously, attachments were sorted by the upload order.
- User's avatars in the posts are now shown without a loading="lazy" attribute.
  If the avatar picture is not found, the default avatar is shown.

## [1.135.3] - 2024-10-22
### Fixed
- Multiple fixes in style handling process:
  - Bootstrap 3 is now a regular dependency in package.json;
  - Modern compiler API of Sass is used, see
    [details](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/#bundlers);
  - All mixed declarations in .scss files were removed, see
    [details](https://sass-lang.com/documentation/breaking-changes/mixed-decls/).
- The last UNSAFE_* methods were removed from React components.

## [1.135.1] - 2024-10-08
### Fixed
- iOS has strange behavior with service workers updates, so use the version file
  method instead.

## [1.135.0] - 2024-10-08
### Added
- The PWA manifest and the service worker was added. The service worker caches
  all site assets, including web fonts. It also caches user profile pictures (up
  to 100 entries). The AppUpdated component periodically checks the service
  worker for update.
### Changed
- Enable player for video attachments. Add a playback time limit for it.
### Fixed
- The SmartTextarea component now handles the 'onPaste' event more precisely.
  When the clipboard contains the text and the image in the same time, both are
  pasted.
- The recipients list of a post was determined incorrectly if some of the post
  groups were not on the page.

## [1.134.4] - 2024-08-26
### Changed
- The 'Privacy' and 'Terms' pages now renders statically from the Markdown files
  and available on the `/docs/privacy` and `/docs/terms` paths. It makes them
  accessible for the checking robots, that cannot execute the JavaScript.

## [1.134.3] - 2024-07-29
### Added
- The autocomplete menu now has a links to the found users/groups pages. These
  links opens in a new tab for the most cases. Links opens in the current tab
  when the user enters the "@username" in the search bar at the beginning of the
  query.
### Changed
- The 'Expandable' component was rewritten using the modern browser APIs. It now
  properly handles the content updates and does not require the content to be
  fully inline.

## [1.134.2] - 2024-07-20
### Fixed
- Style issues for code blocks.

## [1.134.1] - 2024-07-15
### Fixed
- Potentially dangerous RegExp in the code blocks logic.

## [1.134.0] - 2024-07-15
### Added
- Add support for inline code (single backticks) and code blocks (triple backticks)
  to post/comment text parser.
### Fixed
- Autocomplete menu did not update properly after the server autocomplete
  response.

## [1.133.0] - 2024-07-04
### Added
- Add a "description" meta-tag to the index.html.
- Autocomplete for the user/group names in the post and comment inputs. When the
  user types "@" and some text afterwards, the matched users/groups are shown
  beneath the text input.
### Changed
- Switch to V3 server API (with _omittedCommentsOffset_ field and two comments
  after the fold).
### Fixed
- Update SSI patterns in index.html to support dashes in groupnames.
- Bug on iOS that blocks deletion of post's attachments.

## [1.132.0] - 2024-05-27
### Added
- Ability to "unlock" and preview comments from the banned users and with reply
  to the banned users.
### Fixed
- Fixed a bug where the first partial opening of comments ("show last N") would
  open one extra comment.

## [1.131.3] - 2024-05-08
### Fixed
- Separate local and remote file list changes in the file uploader (finish the
  fix in 1.131.1).

## [1.131.2] - 2024-05-08
### Fixed
- Programmatic insertion into the comment text area is now debounced with a
  timeout of 100ms. It prevents races when multiple files are uploaded at the
  same time.
- Very long words now breaks up in the comment preview and at the Notifications
  page.

## [1.131.1] - 2024-05-06
### Fixed
- Fixed a draft fileIds synchronization bug.

## [1.131.0] - 2024-05-05
### Added
- Allow to unfold comments step by step on the home and feed pages.
### Fixed
- Fixed a bug that caused not all uploaded files to be attached to a post.

## [1.130.0] - 2024-04-26
### Added
- Support for symmetric bans: comments of users, who have banned the viewer, are
  hidden for the viewer.

## [1.129.3] - 2024-04-12
### Changed
- Use blurred low-res preview of NSFW images instead of solid gray panels.

## [1.129.2] - 2024-04-10
### Fixed
- Fix the comment form's "Cancel" button behavior in the feed.

## [1.129.1] - 2024-04-10
### Fixed
- Don't show the "Clear" button on empty forms.

## [1.129.0] - 2024-04-09
### Added
- Drafts now can be completely disabled by user.
- Post and comment creation forms now have a "Clear" button that resets the form
  state.
### Fixed
- After a successful password reset, the user is now redirected to the sign-in
  page.

## [1.128.2] - 2024-03-29
### Added
- Ability to read other people's minds.

## [1.128.1] - 2024-03-18
### Fixed
- Youtube returns a 401 response for videos that are not allowed to be embedded.
  These videos used to cause an error, now they are displayed as previews.

## [1.128.0] - 2024-03-01
### Fixed
- Fix lightbox for some old attachments that have no sizes in API responses.
### Added
- Drafts. When a user creates/edits a post or comment, the entered text is
  automatically saved to localStorage. This prevents accidental loss of content
  in case of a bad connection or browser closure. For posts, saved drafts also
  contain attachments and feed name information.

  Draft data automatically synchronized between the browser tabs, but not
  between the other user's devices.

  Drafts are deleted when a post/comment form has been successfully submitted or
  explicitly canceled by the user. When the user signs out, all draft data is
  deleted. Draft data also deletes when the signed in user changes.

  User can disable drafts saving on the Settings / Privacy page. In this case,
  drafts will still work, but will not be saved to persistent storage and will
  be lost on tab close/reload.

## [1.127.3] - 2024-02-14
### Fixed
- Incorrect use of 'useEffect' causing a crash on the 'Manage Group Subscribers'
  page.

## [1.127.2] - 2024-02-04
### Fixed
- Return the 'maximum-scale=1' back to the "viewport" meta tag, but remove it on
  non-iOS platforms. This allows to zoom in page on all platforms, but prevents
  the unwanted auto-zoom on iOS.

## [1.127.1] - 2024-02-02
### Changed
- Upgrade React to v18
- Users can now scale the site with a pinch gesture on mobile devices.
- The lightbox code now detects image sizes faster when showing images from text
  links. User doesn't see a small 100x100 preview anymore.

## [1.127.0] - 2024-01-19
### Changed
- Use the latest (v5) version of PhotoSwipe library.
