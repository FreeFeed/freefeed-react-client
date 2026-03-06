import { useSelector, useStore } from 'react-redux';
import { hashtags } from 'social-text-tokenizer';
import Breadcrumbs from './breadcrumbs';
import FeedOptionsSwitch from './feed-options-switch';
import UserProfile from './user-profile';
import { useNouter } from '../services/nouter';
import PaginatedView from './paginated-view';
import { useMemo } from 'react';
import { VisualContainer } from './post/attachments/visual/container';
import { isPostNSFW } from './select-utils';

const tokenizeHashtags = hashtags();

export default function UserMedia() {
  const { params } = useNouter();
  const username = params.userName.toLowerCase();
  const foundUser = useSelector((state) =>
    Object.values(state.users).find((u) => u.username === username),
  );
  const attachments = useMediaAttachments(foundUser);

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
      <PaginatedView>
        <VisualContainer attachments={attachments} isNSFW={false} isExpanded />
      </PaginatedView>
    </div>
  );
}

function useMediaAttachments(foundUser) {
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

    return feedPostIds
      .flatMap((postId) => {
        const post = allPosts[postId];
        const nsfw = nsfwByPostId.get(postId) ?? false;
        return (post?.attachments || []).map((attId) => ({ attId, nsfw }));
      })
      .map(({ attId, nsfw }) => {
        const att = allAttachments[attId];
        return att ? { ...att, isNSFW: nsfw } : null;
      })
      .filter((att) => att && (att.mediaType === 'image' || att.mediaType === 'video'));
  }, [feedPostIds, allPosts, allAttachments, isNSFWVisible, foundUser, store]);
}
