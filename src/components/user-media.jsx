/* global CONFIG */
import { useSelector, useStore } from 'react-redux';
import { hashtags } from 'social-text-tokenizer';
import Breadcrumbs from './breadcrumbs';
import FeedOptionsSwitch from './feed-options-switch';
import UserProfile from './user-profile';
import { useNouter } from '../services/nouter';
import PaginatedView from './paginated-view';
import { useMemo, useState } from 'react';
import { VisualContainer } from './post/attachments/visual/container';
import { isPostNSFW } from './select-utils';
import { htmlSafe } from '../utils';
import { Helmet } from 'react-helmet';

const tokenizeHashtags = hashtags();

// Persists showNSFW state across remounts within the same userMedia route.
// Resets when switching to a different user.
let nsfwToggleState = { username: null, showNSFW: false };

export default function UserMedia() {
  const { params } = useNouter();
  const username = params.userName.toLowerCase();
  const foundUser = useSelector((state) =>
    Object.values(state.users).find((u) => u.username === username),
  );
  const canViewAccountContent = useCanViewAccountContent(foundUser);

  if (nsfwToggleState.username !== username) {
    nsfwToggleState = { username, showNSFW: false };
  }
  const [showNSFW, setShowNSFWState] = useState(nsfwToggleState.showNSFW);
  const setShowNSFW = (value) => {
    nsfwToggleState.showNSFW = value;
    setShowNSFWState(value);
  };
  const { attachments, hasNSFW } = useMediaAttachments(foundUser, showNSFW);

  const nameForTitle = useMemo(
    () =>
      foundUser.username === foundUser.screenName
        ? foundUser.username
        : `${foundUser.screenName} (${foundUser.username})`,
    [foundUser.screenName, foundUser.username],
  );

  return (
    <div className="box">
      <Helmet>
        <title>
          {nameForTitle} - All media - {CONFIG.siteTitle}
        </title>
      </Helmet>

      <div className="box-header-timeline" role="heading">
        <div className="pull-right">
          <FeedOptionsSwitch />
        </div>
      </div>
      <div className="box-body">
        <Breadcrumbs user={foundUser} breadcrumb="All media" />
        <UserProfile allowToPost={false} noPostLines />
      </div>
      {canViewAccountContent && hasNSFW && (
        <div className="box-body">
          <label>
            <input
              type="checkbox"
              checked={showNSFW}
              onChange={(e) => setShowNSFW(e.target.checked)}
            />{' '}
            Show NSFW media
          </label>
        </div>
      )}
      {canViewAccountContent ? (
        attachments.length > 0 ? (
          <PaginatedView>
            <VisualContainer attachments={attachments} isNSFW={false} isExpanded />
          </PaginatedView>
        ) : (
          <div className="box-body">
            <p>There is no media in this account.</p>
          </div>
        )
      ) : (
        foundUser && (
          <div className="box-body">
            <p>Media is not available for this account.</p>
          </div>
        )
      )}
    </div>
  );
}

// Same logic as in UserProfileHead: don't show media for private/banned accounts
function useCanViewAccountContent(user) {
  const currentUser = useSelector((state) => state.user);
  return useMemo(() => {
    if (!user) {
      return false;
    }
    const isCurrentUser = currentUser?.id === user.id;
    const isBanned = currentUser?.banIds?.includes(user.id);
    const inSubscriptions = currentUser?.subscriptions.includes(user.id);
    return !isBanned && (isCurrentUser || user.isPrivate === '0' || inSubscriptions);
  }, [user, currentUser]);
}

function useMediaAttachments(foundUser, showNSFW) {
  // useStore instead of multiple useSelectors for subscriptions/subscribers/users:
  // isPostNSFW needs these slices, but we don't want to re-render the media
  // gallery every time they change. store.getState() inside useMemo gives us
  // the current values without adding them as reactive dependencies.
  const store = useStore();
  const allPosts = useSelector((state) => state.posts);
  const allAttachments = useSelector((state) => state.attachments);
  const feedPostIds = useSelector((state) => state.feedViewState.entries);
  const isNSFWVisible = useSelector((state) => state.isNSFWVisible);

  return useMemo(() => {
    // Fast path: if the user/group itself has #nsfw in description, all posts are NSFW
    const allNSFW =
      !isNSFWVisible &&
      !!foundUser?.description &&
      tokenizeHashtags(foundUser.description).some((t) => t.text.toLowerCase() === '#nsfw');

    const state = store.getState();

    // Build a postId → isNSFW map (one check per post, not per attachment)
    const nsfwByPostId = new Map();
    for (const postId of feedPostIds) {
      const post = allPosts[postId];
      if (post && !post.deleted) {
        nsfwByPostId.set(postId, allNSFW || isPostNSFW(post, state));
      }
    }

    let hasNSFW = false;
    const attachments = feedPostIds
      .flatMap((postId) => {
        const post = allPosts[postId];
        const isNSFW = nsfwByPostId.get(postId) ?? false;
        if (isNSFW) {
          hasNSFW = true;
        }
        const nsfw = isNSFW && !showNSFW;
        return (post?.attachments || []).map((attId) => ({ postId, attId, nsfw }));
      })
      .map(({ postId, attId, nsfw }) => {
        const att = allAttachments[attId];
        if (!att) {
          return null;
        }
        const post = allPosts[postId];
        const author = post ? state.users[post.createdBy] : null;
        const caption = buildCaption(author, post, postId);
        return { ...att, isNSFW: nsfw, caption };
      })
      .filter((att) => att && (att.mediaType === 'image' || att.mediaType === 'video'));

    return { attachments, hasNSFW };
  }, [feedPostIds, allPosts, allAttachments, isNSFWVisible, showNSFW, foundUser, store]);
}

function buildCaption(author, post, postId) {
  if (!author || !post) {
    return '';
  }
  const avatarUrl = author.profilePictureMediumUrl || '';
  const username = htmlSafe(author.username);
  const postUrl = `/${encodeURIComponent(author.username)}/${encodeURIComponent(postId)}`;

  const maxLen = 150;
  const rawBody = (post.body || '').replace(/\s+/g, ' ').trim();
  const body =
    rawBody.length > maxLen ? htmlSafe(rawBody.slice(0, maxLen)) + '\u2026' : htmlSafe(rawBody);

  // The link is intercepted by LightboxLinkInterceptor (in layout.jsx),
  // which handles SPA navigation instead of a full page reload.
  return (
    `<a href="${postUrl}" class="pswp-caption__link">` +
    `<img src="${htmlSafe(avatarUrl)}" width="20" height="20" class="pswp-caption__avatar" /> ` +
    `<strong>${username}</strong>` +
    (body ? `: ${body}` : '') +
    `</a>`
  );
}
