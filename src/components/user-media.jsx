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

  if (nsfwToggleState.username !== username) {
    nsfwToggleState = { username, showNSFW: false };
  }
  const [showNSFW, setShowNSFWState] = useState(nsfwToggleState.showNSFW);
  const setShowNSFW = (value) => {
    nsfwToggleState.showNSFW = value;
    setShowNSFWState(value);
  };
  const { attachments, hasNSFW } = useMediaAttachments(foundUser, showNSFW);

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        <div className="pull-right">
          <FeedOptionsSwitch />
        </div>
      </div>
      <div className="box-body">
        <Breadcrumbs user={foundUser} breadcrumb="Media" />
        <UserProfile allowToPost={false} noPostLines />
      </div>
      {hasNSFW && (
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
      <PaginatedView>
        <VisualContainer attachments={attachments} isNSFW={false} isExpanded />
      </PaginatedView>
    </div>
  );
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
        return att ? { ...att, isNSFW: nsfw, caption: `Post: ${postId}` } : null;
      })
      .filter((att) => att && (att.mediaType === 'image' || att.mediaType === 'video'));

    return { attachments, hasNSFW };
  }, [feedPostIds, allPosts, allAttachments, isNSFWVisible, showNSFW, foundUser, store]);
}
