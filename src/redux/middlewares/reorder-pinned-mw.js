import { reorderFeedEntries } from '../action-creators';
import { response } from '../action-helpers';
import {
  CREATE_POST,
  PIN_POST,
  REALTIME_COMMENT_NEW,
  REALTIME_LIKE_NEW,
  REALTIME_POST_NEW,
  REALTIME_POST_UPDATE,
  UNPIN_POST,
} from '../action-types';

// Reorder feedViewState.entries so that pinned posts are always at the beginning
export function reorderPinnedMiddleware(store) {
  const feedUpdaters = new Set([
    response(PIN_POST),
    response(UNPIN_POST),
    response(CREATE_POST),
    REALTIME_POST_NEW,
    REALTIME_POST_UPDATE,
  ]);

  const realtimeBumpers = new Set([REALTIME_COMMENT_NEW, REALTIME_LIKE_NEW]);

  return (next) => (action) => {
    const mayNeedReorder =
      feedUpdaters.has(action.type) || (realtimeBumpers.has(action.type) && action.shouldBump);

    if (!mayNeedReorder) {
      return next(action);
    }

    const result = next(action);

    const {
      posts,
      feedViewState: { timeline, entries },
    } = store.getState();

    if (!timeline || timeline.name !== 'Posts' || !timeline.user || entries.length === 0) {
      return result;
    }

    const entriesWithPinnedAt = entries.map((postId, index) => {
      const post = posts[postId];
      const pin = post.pinnedIn?.find((p) => p.targetId === timeline.user) ?? null;
      const pinnedAt = pin ? Date.parse(pin.pinnedAt) : Infinity; // All non-pinned posts are at the end (as pinned at Infinity)
      return { postId, index, pinnedAt };
    });

    // Sort by .pinnedAt first and .index last
    entriesWithPinnedAt.sort((a, b) => {
      if (a.pinnedAt !== b.pinnedAt) {
        return a.pinnedAt - b.pinnedAt;
      }
      return a.index - b.index;
    });

    const newEntries = entriesWithPinnedAt.map((entry) => entry.postId);
    const isChanged = newEntries.some((v, i) => v !== entries[i]);

    if (isChanged) {
      store.dispatch(reorderFeedEntries(newEntries));
    }

    return result;
  };
}
