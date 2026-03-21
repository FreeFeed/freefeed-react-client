# Changelog 2022

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### Changed
- Take Save out of "more" menu

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

