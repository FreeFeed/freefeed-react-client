# Changelog 2023

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.126.0] - 2023-12-21
### Added
- User can now turn on/off notifications for new comments on the posts they
  commented on.

## [1.125.1] - 2023-11-24
### Fixed
- Missing post submission form on group pages.

## [1.125.0] - 2023-11-24
### Added
- The site administrator can now define a list of "privacy control groups" in
  the config (the _privacyControlGroups_ entry). These groups will be always
  shown in the feed selector of new or existing posts. The pages of such groups
  do not show posts by default, and such groups cannot be subscribed to.
- Support for the new "Notify of new comments" feature:
  - User can now turn on/off notification for new comments on the specific post
    via the "More" menu item;
  - User can now turn on/off notification for new comments on their own posts;
  - The new "Comments" tab has been added to the "Notifications" page.
### Changed
- The wording "Disable blocked contingent..." (in the context of groups) has
  been replaced by "Show blocked content..." as more clear.

## [1.124.2] - 2023-10-25
### Fixed
- Checkboxes in texts was broken during the 'social-text-tokenizer' upgrade.

## [1.124.1] - 2023-10-11
### Fixed
- Some SASS issues.

## [1.124.0] - 2023-10-11
### Changed
- The feed selector ('To:' line) is now always visible in the post creation
  form.
- The "Edit list" link is no longer shown next to the Home or friend list page
  title. It has been moved to the "•••" menu on the right side of the list
  header.
- Upgrade 'social-text-tokenizer' (the post/comment texts parser) to the version
  3.0.

### Fixed
- Reddit r/-links were displayed incorrectly.
- During direct message editing, there is no access check of the existing
  recipients (even if some of them are gone). This check is unnecessary because
  the message author cannot remove the existing recipients anyway.

## [1.123.3] - 2023-09-15
### Fixed
- The algorithm for displaying the "Expand" button in "compact" text mode has
  been fixed.

## [1.123.2] - 2023-09-10
### Fixed
- Post actions didn't work on the post backlinks page.

## [1.123.1] - 2023-09-07
### Fixed
- The non-existent post page did not display the correct error message.

## [1.123.0] - 2023-09-05
### Added
- Links to posts and comments are now shorter: e.g. `/user/4a39b8` (a post) or
  `/groupname/f482e5#ad2b` (a comment).
  - All public URLs and links to posts and comments are now in short format.
  - Addresses of posts and comments with leading slash (`/user/...`) are now
    parses in texts as active links.
  - Old-fashion links, with long UIDs, are still fully supported.
- New page(s) `/:userName/:postId/backlinks` that displays posts that link to
  this post. This replaces the old way of displaying backlinks, which used
  search.

### Changed
- Spoiler tag can now contain line feeds. In addition, user text formatting
  utilizes simpler HTML, with fewer wrappers. Visually, the output for the user
  is not changed (except for line translations in spoilers).
- Text checkboxes are not processed in a special way if there is more than one
  of them in the text.

### Fixed
- The default font set no longer includes the Helvetica family when the client
  platform is Windows. Helvetica is not a native font in Windows, and the
  manually installed version of the font may be incomplete (for example, not
  contain Cyrillic).
- Updated TWEET_RE regex to support matching x.com in addition to twitter.com.

## [1.122.1] - 2023-08-10
### Changed
- Disable player for video attachments until we can deal with the increased
  traffic from them.

## [1.122.0] - 2023-07-31
### Added
- Comments can now be used as checklists if the comment text starts with "[ ]"
  or "[x]" (one can use other symbols in parentheses as well: [v], [*], [🗸], or
  Russian "Ha").
  
  If the current user matches the author of the comment, an interactive checkbox
  is displayed at the beginning of the text. When the user clicks the checkbox,
  the comment text changes to reflect the checkbox state.

  For other users, a fixed-width text representation of the checkbox is shown:
  "[ ]" or "[🗸]".
### Fixed
- Telegram previews now supports dark theme

## [1.121.1] - 2023-07-15
### Fixed
- Expand texts of translated posts/comments

## [1.121] - 2023-07-15
### Added
- Ability to translate the text of comments and posts (if supported by the
  server). Users can set their language for translation in the preferences (the
  browser language is used by default). There is a new "Translate to..." item in
  the "More" menu for comments/posts.
### Fixed
- User can now search for "My feed" in feeds selector
- Increased margin under the "Expand preview" button

## [1.120.2] - 2023-06-22
### Fixed
- Bookmarklet did not open
  - Bookmarklet component is now wrapped in Suspense because it is loaded
    dynamically
- UserSubscriptionEditPopup did not open when one clicked the 'edit' button
  - Fixed import of UserSubscriptionEditPopup component
  - The component returned by the 'lazyComponent' helper now receives a
    reference

## [1.120.1] - 2023-06-15
### Changed
- Deprecated 'vazir-font' package replaced with 'vazirmatn'
### Fixed
- Startup styles are applied only to the initial state of the page and do not
  interfere with application styles.

## [1.120] - 2023-06-14
### Changed
- The start script that initiates the configuration and sets the color scheme is
  now injected into the HTML code. The custom configuration is also injected
  using SSI, if possible. This allows instant access to the configuration,
  without an additional HTTP request, and allows the correct color scheme to be
  applied before the document body starts rendering. This, in turn, gets rid of
  the blinking when the page loads.
### Fixed
- Initial layout styles, to prevent jerking while loading
- Added support for legacy browsers, that doesn't support modern ES features

## [1.119] - 2023-06-02
### Added
- Show the next comment in the same comment preview panel when clicking on the
  "^^" in the comment preview.
### Changed
- Use Vite as builder and Vitest as test runner. We no longer need Webpack,
  Mocha, Jest, and (mostly) Babel! Also:
  - 'lodash' replaced with 'lodash-es' for better tree shaking
  - Rare used pages, components and libraries now loaded asynchronously
- Multiple cosmetic corrections preparing the transition to Vite as a builder:
  - Use Dart Sass instead of node-sass
  - Use math.div instead of "/" in SCSS files
  - Rename files uses JSX syntax from .js to .jsx
  - Remove non-standard do {} syntax
  - Use explicit import() statements in the index.jsx
  - Use relative css imports for styles from node_modules
  - Update stylelint calls and fix styles issues
- The users and groups pages now shows dynamically calculated statistics.
- All "a" links without the "href" attribute and some other pseudo-buttons have
  been replaced by the ButtonLink component. This improves the keyboard
  accessibility of the site because ButtonLink is able to focus and click from
  the keyboard.
### Fixed
- The backlink click now doesn't reload a full page.
- On iOS, the feed selector doesn't focus properly after clicking the Add/Edit
  button.

## [1.118] - 2023-05-05
### Added
- Support for Aparat.com video hosting
- Support for songs on music.youtube.com
- Support for YouTube playlists
- Calender view

### Changed
- Updated feed selector component:
  - The react-select library has been updated from v1 to v5
  - It is possible to create posts in non-private groups without being a member
    of them. A post creation form is available on the pages of such groups.
  - All post creation and editing form controls are now accessible from the
    keyboard.
  - The feed selector can search by username and screenname. Search with an
    incorrect keyboard layout is possible (English, Russian and Ukrainian
    layouts are supported).
  - Privacy indication is improved:
    - The "Post" button shows the privacy icon of the post being created.
    - The feed selector shows group privacy icons.
    - A warning is shown if the post is published in groups with different
      privacy levels.

### Fixed
- Minor attachment-related issues:
  - More reliably detect screenshot paste,
  - Proper pass the file name to attachment creation method.
- An error inserting pictures when editing a post
- Titles of YouTube videos are properly displayed now

## [1.117.1] - 2023-04-01
### Fixed
- Hiding attachments under the 'read more' fold

## [1.117] - 2023-03-31
### Added
- A new "Mention @username" item has been added to the post's dropdown menu.
  By clicking on it, you can start a new comment and mention the person who
  created the post, or add their @username to the comment you have already started creating.
- Vimeo on demand links support
### Changed
- Take Save out of "more" menu
- The Dropzone library has been replaced with a custom file uploader.
  Attachments for posts and comments are now uploaded uniformly. The CreatePost
  and PostEditForm components have been redesigned to utilize the new uploader.
- The internal SubmittableTextarea component replaced by new SmartTextarea. The
  SmartTextarea allows to:
  - submit text by Enter of Ctrl/Cmd+Enter;
  - handle files paste and drag-n-drop;
  - insert text to the cursor position using 'insertText' instance method;
  - use 'onText' attribute to handle updated text (it is necessary for
    'insertText' updates, which doesn't trigger onChange).

  This component handles all tasks related to creating/editing posts and
  comments in a unified way.

## [1.116.1] - 2023-03-11
### Fixed
- Minor bugs

## [1.116] - 2023-03-10
### Added
- Rich event preview on Notifications page. Every event now has a user picture
  and text of comment or post (if this event is comment- or post-related).
- Reddit's `r/subreddit` and `/r/subreddit` addresses are now auto-linked.
### Changed
- "Delete" item of the "More" menu is visible to the user for every comment in user’s own post
- "Delete" item of the "More" menu is visible to a group admin for every comment

## [1.115.2] - 2023-02-21
### Fixed
- Incorrect "Block user" popup display on user card.
- "Add comment" link doesn't properly focus input on iOS.

## [1.115.1] - 2023-02-14
### Fixed
- The "Add comment" input on iOS in the feed view is now correctly focused
  after creation.
- Broken lightbox view from the comment preview modal window.
### Changed
- The "Comment" link now always opened and focus the "Add comment" input.
  Previously, a second click closed the input field.

## [1.115] - 2023-02-10
### Added
- Confirmation with short info on click on every "Block user" button.
- Disabling bans in groups:
  - Checkbox in group settings (for administrators) to disable/enable bans in
    groups;
  - Add "Disable/Enable blocking in group" buttons on group page;
  - Group group-related actions in drop-down menu in group profile;
  - New events on Notifications page.
### Fixed
- Reload user/group feed after ban/unban and enable/disable bans in group.
- Show creation time and inviting user in gone user profile.
- Click on main comment link on a single post page now moves focus to the comment form

## [1.114] - 2023-01-19
### Added
- Invite-only registration support. Updated invite creation, invite use and sign
  up forms. There is new section in config, _registrationsByInvite_, with the
  _formIframeSrc_ field. It allows to define URL of some external form for
  manual registration requests.

### Changed
- TikTok previews now display as static images and load a full-featured embed
  only after a click.
