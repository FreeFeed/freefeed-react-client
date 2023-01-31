# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.115] - Not released
### Added
- Show creation time and inviting user in gone user profile.

## [1.114] - 2023-01-19
### Added
- Invite-only registration support. Updated invite creation, invite use and sign
  up forms. There is new section in config, _registrationsByInvite_, with the
  _formIframeSrc_ field. It allows to define URL of some external form for
  manual registration requests.

### Changed
- TikTok previews now display as static images and load a full-featured embed
  only after a click.

## [1.113] - 2022-12-25
### Added
- Email verification support. If verification is supported by server, the new
  field (Verification code) is appear in Sign Up and Profile forms. When user
  sets up or updates email address, they should receive verification code on it
  and enter that code to the form.
- NodeJS 18.x is supported now

### Changed
- "Everything", "Search" and "Best of" pages are not available for
  non-authorized users.
- Updated texts about donations to FreeFeed MTÜ

## [1.112] - 2022-11-25
### Added
- Group administrators can now block users in their managed groups. A blocked
  user cannot post to the group, but can read and comment if the group is not
  private.
- Video attachments now have a player, when browser supports them
- YouTube shorts now supported in media viewer

### Fixed
- No refresh needed to view private users and groups after subscription approved
- No refresh needed to interact with new subscription requests
- Hidden comment class name updated to avoid interference with Firefox builtin extension style

## [1.111.2] - 2022-09-23
### Fixed
- Fix broken PhotoSwipe icons

## [1.111.1] - 2022-09-08
### Fixed
- Restore Vazir font (new css-loader didn't load it in 1.111.0)

## [1.111.0] - 2022-09-07
### Added
- Instagram Reels are supported by native previews.
  First contribution by [Mohammad Jafari](https://github.com/MMDJafari/). Thanks!
- It is now possible to hide posts by hashtags! Also, the underlying algorithm
  allows to add other types of hiding criteria in the future.

## [1.110.0] - 2022-06-29
### Fixed
- The erroneous "Remove from" items has been removed from the post's "More" menu
- Fixed domain-name in donate link

## [1.109.0] - 2022-05-12
### Fixed
- On the "Manage Subscribers" group's page, the list of administrators changed
  as the cursor moved over the group members.
- Do not show "Promote" button for deleted users.
- Restore style of the homefeed-dropdown.

### Changed
- The `/CURRENT_USERNAME/subscribers` and `/CURRENT_USERNAME/subscriptions`
  addresses now redirects to the corresponding tabs of the `/friends` page.
- The 'Subscribe' and 'Request a subscription' links no longer open the home
  feed selection window. The subscription is always made to the main Home feed,
  and then the user can change the feed.

## [1.108.2] - 2022-04-20
### Fixed
- Restored "url" and "querystring" polyfills required by webpack.

## [1.108.1] - 2022-04-20
### Fixed
- Restore use of IEC-units for file-sizes.

## [1.108.0] - 2022-04-20
### Added
- Links to the user/group memories in the sidebar of the user/group-related
  pages
- Click on the ^^^-reference shows a preview of the referenced comment

### Fixed
- Remove usage of "screen name" in favor of "display name" in UI

### Changed
- Improve texts for account privacy settings

## [1.107.1] - 2022-03-24
### Changed
- Show registration date in Profiles and Groups

## [1.107.0] - 2022-03-24
### Fixed
- Update "privacy" cookie if it is already set. It should prevent 2-weeks cookie
  expiration in Safari.
- Add extra space between username and "is not in any of your friend lists"
  message.

### Added
- New "Sanitize media files" page (/settings/sanitize-media) which allows to
  remove sensitive metadata from the existing media files.
- New frontend setting: comments.hideRepliesToBanned (false by default, can be
  adjusted on Settings / Appearance page). If it is set to true, comments that
  starts with a @-mention of banned user are replaced by placeholder ('Comment
  with reply to blocked user'). Comments authored by the current user are always
  visible.

### Removed
- Do not try to preview shorten TikTok URLs in posts.

## [1.106.1] - 2022-02-03
### Fixed
- Re-release. 1.106.0 has incorrect merge.

## [1.106.0] - 2022-02-03
### Added
- New flag on the "Privacy" Settings page: "Remove geolocation and other
  sensitive metadata from photos and videos you post".
- Show "you are subscribed" checkmark in "all groups" list
- Display subscription requests alert box on user's profile feed
- "You are subscribed" checkmark in the "All groups" page

### Changed
- Increase p-break height in posts
- Remove extra whitespace around post actions list

### Fixed
- Keep "back=" in URL when linking from "Sign in" to "Sign up"

## [1.105.1] - 2022-01-05
### Added
- Display an indicator between comments that are more than 6 days apart

## [1.105.0] - 2022-01-05
### Added
- Backlinks indication under the post (in form of "N references to this post" link)
- Allow users to leave the direct message (except the author of the message)
- GitHub workflow for creating PR preview on surge.sh
- Internal bugs related to the showing of direct post destination feeds during
  and after editing

### Changed
- The link preview components was refactored to use the modern web APIs and the
  modern React practices.

## [1.103.1] - 2021-11-12
### Fixed
- Accept Apple-music urls without ?l= parameter

## [1.103.0] - 2021-11-12
### Added
- New syntax for the distant comment ^-references. The near references uses a
  familiar syntax ^, ^^…, but starting from five caps these references now
  inserted as ^5, ^6 and so on.
- New appearance flag allows to use post/users hides not only in main Home feed,
  but also in Discussions, Everything, Best of… and user's friend lists pages.
  This flag is off by default.
- Support for cross-platform usernames, i.e. user@mokum, user@lj and so on. The
  services shortcodes and formats should be defined in the config.json (see
  textFormatter.foreignMentionServices in config/default.js).
- Native previews for Apple Music

### Changed
- The comment ^-references are now based of comments sequentional numbers. It
  makes them stable and independent of user's appearance settings. Event if user
  chooses to hide comments from blocked users, the ^-references will point to
  the right places.

### Fixed
- In the dark theme, the Embedly iframes had a white background. For some
  unclear reason we should 'color-scheme' CSS property for the iframe to make it
  background transparent again.
- Blur (un-focus) the ButtonLink conponent after the mouse click. This prevents
  an unwanted onClick from being triggered if the user presses the spacebar (to
  scroll) after a mouse click.

## [1.102.4] - 2021-10-22
### Fixed
- Fix inverted autoplay setting for Vimeo (introduced in 1.102.3)

## [1.102.3] - 2021-10-22
### Fixed
- Generate proper embed-player for private Vimeo videos
- Detect legacy "http" Vimeo urls

## [1.102.2] - 2021-10-17
### Fixed
- Re-release. 1.102.1 did not include proper version information. 

## [1.102.1] - 2021-10-17
### Fixed
- Merge bug that prevents the "Text scale" controll on Appearence page from
  working.
- 'webpack-cli' was updated to fix the dev server.

## [1.102.0] - 2021-10-10
### Added
- The 'color-scheme' CSS property now applies on dark/light site mode. This
  property allows to set color scheme for browser UI elements such as scrollbars
  and form inputs.
- "Grips" in sidebar for drag and sort home feeds. Previously, the drag zone
  matched the feed link itself, and that was inconvenient, especially on mobile
  screens.
- "More" menu to posts
- There are two text submit modes now: the Mobile and the Desktop mode. The site
  will try to automatically determine whether it runs on desktop or mobile
  browser. User can manually select the submit mode, this setting will be saved
  in browser storage.
  - In Mobile mode, the Ctrl+Enter and Cmd+Enter acts as submit and Enter press
    caused line break.
  - In Desktop mode, the Enter press acts as submit, to insert a new line user
    should press Shift+Enter or Alt+Enter.
- Some frontend preferences defaults can now be overridden depending on the
  account's createdAt date. It is useful for the new defaults that breaks the
  old behaviour and shouldn't affect the existing users.

### Removed
- The Space+Enter functionality is removed. It is no longer necessary since we
  have Mobile submit mode now.

## [1.101.2] - 2021-10-07
### Fixed
- Re-release. 1.101.1 did not include proper version information. 

## [1.101.1] - 2021-10-07
### Fixed
- In the old days, users could create groups with groupnames up to 27 characters
  long. Now the client router supports these names.

## [1.101.0] - 2021-09-19 
### Added
- User can adjust the site font size in settings' Appearance tab. This setting
  is saved locally in web browser and can be different for each browser and each
  device. The available font size range is 80% - 150% relative to the default
  size.
- Notification messages for the 'backlink_in_post' and 'backlink_in_comment'
  events.

### Changed
- Post can now have an empty body if it contains one or more attachments.
- The sidebar memories years now starts from 2005.

### Fixed
- Fix the mobile Chrome unwanted font boosting
- Fix invalis data of the some archive posts

## [1.100.0] - 2021-07-30
### Added
- Warning about the orphan groups on the "Delete account" page.
- Lightbox-navigation between attachments of single comment

### Changed
- The Highcharts library replaced by the Recharts due to license incompatibility.

### Fixed
- Group admins now can remove a post from one group at a time
  ([#1398](https://github.com/FreeFeed/freefeed-react-client/issues/1398))

## [1.99.1] - 2021-07-03
### Fixed
- Show missing throbber in "more comments" loader

### Added
- Added explicit error-handlers to naked promises

## [1.99.0] - 2021-06-08
### Added
- Display usernames of gone users in post comments in grey color
- Headers of sidebar blocks are links now
- "More" menu for comments with all comment-related actions and information

### Fixed
- Changes in search field on the "All Groups" page now resets the page number to
  the first page. Also the page and the query string are now synchronized with
  the URL's query parameters.
- A group table on 'All Groups" page is scrollable on narrow screens now
- Fix accessibility-labels of comment-likes (actions were opposite to the real ones)

### Changed
- Removed thin red line in upload preview
- Point beta-reports to "beta" group instead of "support"

## [1.98.2] - 2021-04-09
### Fixed
- Accept the 'q' GET-parameter as search query in the header form

## [1.98.1] - 2021-04-09
### Fixed
- Typo on Donate page

## [1.98.0] - 2021-04-08
### Added
- Generate '_dist/version.txt' file during production build. This file contains
  build version and date and can be used to auto-check the client updates.
- The client now can detect the updates of its code on the server and advice the
  user to reload the page. This feature is turned off by default. When enabled,
  the client makes a HEAD request every 5 minutes (configurable) to the specific
  address ("/version.txt" is recommended) and looks for the specific response header
  ("Last-Modified" by default). When the header value is changed, the information bar is
  shown to the user: “There’s a new update for FreeFeed available!
  _Refresh_the_page_ when you are ready.”
- Confirmation dialog when the private user wants to unsubscribe someone from
  himself.
- Donation 'traffic light' in the sidebar. This widget depends of
  `donations.statusAccount` config field (null by default means no widget). This
  field should contain the _username_ of the group (or user) whose _screenname_
  sets the donate status. The available statuses are 'Very good', 'Good', 'OK',
  'Very low', 'Low', 'Critical'. The widget performs case-independent search for
  these substrings in the screenname.
- Donation parameters (PayPal button ids, LiberaPay and YooMoney widgets) are
  now configurable by config.
- New mobile-friendly Sidebar and search-input

### Fixed
- When the user visits the post by non-canonical URL, the client replaces URL to
  canonical one, keeping the query string and hash if present. Previously the
  query string and hash were not preserved.
- The scroll compensation isn't applied now when the window scrollY position is 0.
  So when some content appears on the top of the page, it will not caused scroll
  compensation and will not be hidden under the top window edge.
- The info popups now shows properly for users that changed their usernames.
- The 'beta' cookie is now re-installed every time the application started. This
  is to trick Safari that deletes cookies after 7 days.

### Changed
- Removed old invalid links to Clio and "Archives F.A.Q."
- Post created by the user with 'Create post' from is showing with expanded
  comments. The user can add multiple comments to the newly created post and
  they will not be suddenly collapsed.

## [1.97.0] - 2021-03-18
### Fixed
- If the anonymous user visits the page that require authorization, the browser
  redirects to the `/signin?back=…` page. Previously, the back parameter
  included only the pathname of the page, not the query and hash. It is fixed,
  and now it includes pathname + query + hash. It is especially important for
  the magic links to the token creation page.
- The COMPLETE_POST_COMMENTS responses was not fully processed, leading to
  `Cannot read property 'username' of null` errors when updating comments.
- Tapping a user link was sometimes recognized as a mouse click on iOS devices.
- Make reducers compatible with offline state (they didn't know how to handle connectivity errors previously)

### Added
- The 'Sign In' link in the header now has '?back=...' parameter that will
  redirect user back to the viewed page after sign in.
- Forced page reloading after sign out. This guarantees a complete
  reinitialization of the state, which, unfortunately, is difficult to achieve
  by other methods.
- Handle incorrect memory-urls as explicit "error 404"

## [1.96.1] - 2021-03-11
### Fixed
- Properly update state of groups in realtime

## [1.96.0] - 2021-03-11
### Added
- Error timestamp in error boundary message

### Fixed
- The COMPLETE_POST_COMMENTS responses was not fully processed, leading to
  `Cannot read property 'username' of null` errors when updating comments.
- Deleting the friend list may have caused an error in the sidebar.

### Changed
- Underline sidebar links on hover
- User links in the sidebar (link to the current user and to the recent groups)
  doesn't show informational popup anymore.

## [1.95.4] - 2021-03-07
### Fixed
- The numbers of likes of omitted comments now updates in the real time.
- The posts and comments data now fully rewrites on feed update. It has been
  broken in recent releases and click on FreeFeed logo wasn't collapse expanded
  comments and likes

### Changed
- Moved comments highlight logic from redux to PostComments' state

## [1.95.3] - 2021-03-05
### Fixed
- Update comments data on realtime event

## [1.95.2] - 2021-03-04
### Fixed
- Restore highlighting of comments on author name hover (regression in 1.95.0)

## [1.95.1] - 2021-03-04
### Fixed
- Set beta channel flag after the preferences update response

## [1.95.0] - 2021-03-03
### Fixed
- Group screennames in the right menu and in the page titles now updates in the
  real time

### Added
- Links between All Groups and Your Groups pages
- Jest-based snapshot tests

### Removed
- Remove previews for the Reddit links. Reddit embeds can contain a video with
  sound that plays automatically in the feed.

### Changed
- The logic for expanding/collapsing comments has been rewritten. Now up to two
  comments can be seen after the fold. If after deleting a comment there are no
  comments left before or after the fold, new data is fetched from the server.
  If any of the comments are being edited, they won't fold until the editing is
  finished.

## [1.94.0] - 2021-02-18
### Fixed
- Tiktok previews work for videos with empty title

### Changed
- Optimized build results: split code in smaller js-bundles, pre-compress js/css files
- On touch devices, where hover is not available, the user info popup now
  appears after clicking the user link. To navigate to the user's page, you need
  to click on the link inside the popup.
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
- The "Beta version" functionality. The instance can be declared as beta
  version. In this case the "Beta" subheader and the floating "Report a bug"
  button is shown.

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
