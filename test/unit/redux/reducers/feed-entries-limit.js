import { describe, it, beforeEach } from 'vitest';
import expect from 'unexpected';

import { feedViewState } from '../../../../src/redux/reducers';
import { response } from '../../../../src/redux/action-helpers';
import * as ActionTypes from '../../../../src/redux/action-types';

// Mock CONFIG to use test values
global.CONFIG = {
  ...global.CONFIG,
  feed: {
    maxEntries: 60,
  },
};

describe('feedViewState entries limit', () => {
  let state;

  beforeEach(() => {
    // Create initial state with 50 entries (less than maxEntries = 60)
    state = {
      ...feedViewState(undefined, { type: 'init' }),
      entries: Array.from({ length: 50 }, (_, i) => `post${i}`),
    };
  });

  describe('CREATE_POST', () => {
    it('should keep entries within limit when adding new post', () => {
      const action = {
        type: response(ActionTypes.CREATE_POST),
        payload: { posts: { id: 'new-post' } },
      };

      const result = feedViewState(state, action);

      expect(result.entries, 'to have length', 51); // 50 + 1 = 51 (still under limit)
      expect(result.entries[0], 'to equal', 'new-post'); // new post at beginning
    });

    it('should limit entries when exceeding maxEntries', () => {
      // Create state with 60 entries (at limit)
      const fullState = {
        ...state,
        entries: Array.from({ length: 60 }, (_, i) => `post${i}`),
      };

      const action = {
        type: response(ActionTypes.CREATE_POST),
        payload: { posts: { id: 'new-post' } },
      };

      const result = feedViewState(fullState, action);

      expect(result.entries, 'to have length', 60); // Should stay at limit
      expect(result.entries[0], 'to equal', 'new-post'); // new post at beginning
      expect(result.entries, 'not to contain', 'post59'); // oldest post removed
    });

    it('should not add duplicate post', () => {
      const stateWithDuplicate = {
        ...state,
        entries: ['existing-post', ...state.entries.slice(1)],
      };

      const action = {
        type: response(ActionTypes.CREATE_POST),
        payload: { posts: { id: 'existing-post' } },
      };

      const result = feedViewState(stateWithDuplicate, action);

      expect(result.entries, 'to have length', 50); // No change
      expect(result.entries[0], 'to equal', 'existing-post');
    });
  });

  describe('REALTIME_POST_NEW', () => {
    it('should limit entries when realtime post exceeds limit', () => {
      const fullState = {
        ...state,
        entries: Array.from({ length: 60 }, (_, i) => `post${i}`),
      };

      const action = {
        type: ActionTypes.REALTIME_POST_NEW,
        post: { id: 'realtime-post' },
        shouldBump: true,
        insertBefore: 'post10', // Insert at position 10
      };

      const result = feedViewState(fullState, action);

      expect(result.entries, 'to have length', 60);
      expect(result.entries, 'to contain', 'realtime-post');
      expect(result.entries, 'not to contain', 'post59'); // oldest post removed
      const insertIndex = result.entries.indexOf('realtime-post');
      const post10Index = result.entries.indexOf('post10');
      expect(insertIndex, 'to be', post10Index - 1);
    });

    it('should not add post if shouldBump is false', () => {
      const action = {
        type: ActionTypes.REALTIME_POST_NEW,
        post: { id: 'realtime-post' },
        shouldBump: false,
      };

      const result = feedViewState(state, action);

      expect(result.entries, 'to have length', 50); // No change
      expect(result.entries, 'not to contain', 'realtime-post');
    });

    it('should not add duplicate post', () => {
      const stateWithDuplicate = {
        ...state,
        entries: ['existing-post', ...state.entries.slice(1)],
      };

      const action = {
        type: ActionTypes.REALTIME_POST_NEW,
        post: { id: 'existing-post' },
        shouldBump: true,
      };

      const result = feedViewState(stateWithDuplicate, action);

      expect(result.entries, 'to have length', 50); // No change
    });

    it('should insert post at correct position when insertBefore is specified', () => {
      const action = {
        type: ActionTypes.REALTIME_POST_NEW,
        post: { id: 'inserted-post' },
        shouldBump: true,
        insertBefore: 'post25',
      };

      const result = feedViewState(state, action);

      expect(result.entries, 'to have length', 51);
      const insertIndex = result.entries.indexOf('inserted-post');
      const post25Index = result.entries.indexOf('post25');
      expect(insertIndex, 'to be', post25Index - 1);
    });

    it('should add post to end when insertBefore is null', () => {
      const action = {
        type: ActionTypes.REALTIME_POST_NEW,
        post: { id: 'end-post' },
        shouldBump: true,
        insertBefore: null,
      };

      const result = feedViewState(state, action);

      expect(result.entries, 'to have length', 51);
      expect(result.entries[50], 'to equal', 'end-post'); // Last position
    });
  });

  describe('REALTIME_LIKE_NEW', () => {
    it('should limit entries when liked post exceeds limit', () => {
      const fullState = {
        ...state,
        entries: Array.from({ length: 60 }, (_, i) => `post${i}`),
      };

      const action = {
        type: ActionTypes.REALTIME_LIKE_NEW,
        post: { posts: { id: 'liked-post' } },
        shouldBump: true,
      };

      const result = feedViewState(fullState, action);

      expect(result.entries, 'to have length', 60);
      expect(result.entries[0], 'to equal', 'liked-post'); // liked post at beginning
      expect(result.entries, 'not to contain', 'post59'); // oldest post removed
    });

    it('should not add post if shouldBump is false', () => {
      const action = {
        type: ActionTypes.REALTIME_LIKE_NEW,
        post: { posts: { id: 'liked-post' } },
        shouldBump: false,
      };

      const result = feedViewState(state, action);

      expect(result.entries, 'to have length', 50); // No change
      expect(result.entries, 'not to contain', 'liked-post');
    });

    it('should not add post if post is missing', () => {
      const action = {
        type: ActionTypes.REALTIME_LIKE_NEW,
        shouldBump: true,
      };

      const result = feedViewState(state, action);

      expect(result.entries, 'to have length', 50); // No change
    });
  });

  describe('REALTIME_COMMENT_NEW', () => {
    it('should limit entries when commented post exceeds limit', () => {
      const fullState = {
        ...state,
        entries: Array.from({ length: 60 }, (_, i) => `post${i}`),
      };

      const action = {
        type: ActionTypes.REALTIME_COMMENT_NEW,
        post: { posts: { id: 'commented-post' } },
        shouldBump: true,
      };

      const result = feedViewState(fullState, action);

      expect(result.entries, 'to have length', 60);
      expect(result.entries[0], 'to equal', 'commented-post'); // commented post at beginning
      expect(result.entries, 'not to contain', 'post59'); // oldest post removed
    });

    it('should not add post if shouldBump is false', () => {
      const action = {
        type: ActionTypes.REALTIME_COMMENT_NEW,
        post: { posts: { id: 'commented-post' } },
        shouldBump: false,
      };

      const result = feedViewState(state, action);

      expect(result.entries, 'to have length', 50); // No change
      expect(result.entries, 'not to contain', 'commented-post');
    });
  });

  describe('Feed loading', () => {
    it('should not limit entries on initial feed load', () => {
      // This simulates server-side pagination, which should not be limited
      const action = {
        type: response(ActionTypes.GET_EVERYTHING),
        payload: {
          posts: Array.from({ length: 100 }, (_, i) => ({ id: `post${i}` })),
          isLastPage: false,
        },
      };

      const result = feedViewState(state, action);

      // Feed response should replace entries entirely, not apply limit
      expect(result.entries, 'to have length', 100);
    });
  });
});
