import { describe, it, beforeEach } from 'mocha';
import expect from 'unexpected';

import {
  postsViewState,
  users,
  user,
  posts,
  realtimeSubscriptions,
  feedViewState,
  comments,
} from '../../../../src/redux/reducers';
import {
  REALTIME_COMMENT_NEW,
  REALTIME_COMMENT_DESTROY,
  REALTIME_LIKE_NEW,
  REALTIME_POST_NEW,
  REALTIME_GLOBAL_USER_UPDATE,
  REALTIME_POST_HIDE,
  REALTIME_POST_UNHIDE,
} from '../../../../src/redux/action-types';
import { realtimeSubscribe, realtimeUnsubscribe } from '../../../../src/redux/action-creators';

describe('realtime events', () => {
  describe('users()', () => {
    const testUser = { id: 1, name: 'Ururu' };
    const usersBefore = { [testUser.id]: testUser };
    const anotherTestUser = { id: 2, name: 'Arara' };

    it(`shouldn't replace user on REALTIME_POST_NEW if pre-existed`, () => {
      const result = users(usersBefore, {
        type: REALTIME_POST_NEW,
        users: [{ id: 1 }],
      });

      expect(result[testUser.id], 'to equal', testUser);
    });

    it(`shouldn't replace user on REALTIME_COMMENT_NEW if pre-existed`, () => {
      const result = users(usersBefore, {
        type: REALTIME_COMMENT_NEW,
        users: [{ id: 1 }],
      });

      expect(result[testUser.id], 'to equal', testUser);
    });

    it(`shouldn't replace user on REALTIME_LIKE_NEW if pre-existed`, () => {
      const result = users(usersBefore, {
        type: REALTIME_LIKE_NEW,
        users: [{ id: 1 }],
      });

      expect(result[testUser.id], 'to equal', testUser);
    });

    it('should add new user on REALTIME_POST_NEW if not present', () => {
      const result = users(usersBefore, {
        type: REALTIME_POST_NEW,
        users: [anotherTestUser],
      });

      // user data is processed with some parsing, so link wouldn't be the same
      expect(result[anotherTestUser.id].name, 'to equal', anotherTestUser.name);
    });

    it('should add new user on REALTIME_COMMENT_NEW if not present', () => {
      const result = users(usersBefore, {
        type: REALTIME_COMMENT_NEW,
        users: [anotherTestUser],
      });

      expect(result[anotherTestUser.id].name, 'to equal', anotherTestUser.name);
    });

    it('should add new user on REALTIME_LIKE_NEW if not present', () => {
      const result = users(usersBefore, {
        type: REALTIME_LIKE_NEW,
        users: [anotherTestUser],
      });

      expect(result[anotherTestUser.id].name, 'to equal', anotherTestUser.name);
    });

    it('should update user on REALTIME_GLOBAL_USER_UPDATE if present', () => {
      const result = users(usersBefore, {
        type: REALTIME_GLOBAL_USER_UPDATE,
        user: { ...testUser, name: 'New name' },
      });

      expect(result[testUser.id].name, 'to equal', 'New name');
    });

    it('should not touch state on REALTIME_GLOBAL_USER_UPDATE if user is not present', () => {
      const result = users(usersBefore, {
        type: REALTIME_GLOBAL_USER_UPDATE,
        user: anotherTestUser,
      });

      expect(result, 'to be', usersBefore);
    });
  });

  describe('user()', () => {
    const testUser = { id: 1, name: 'Ururu' };
    const userBefore = { ...testUser, frontendPreferences: { foo: 'bar' } };
    const anotherTestUser = { id: 2, name: 'Arara' };

    it('should update user on REALTIME_GLOBAL_USER_UPDATE if present', () => {
      const result = user(userBefore, {
        type: REALTIME_GLOBAL_USER_UPDATE,
        user: { ...testUser, name: 'New name' },
      });

      expect(result.name, 'to equal', 'New name');
    });

    it('should not touch frontendPreferences on REALTIME_GLOBAL_USER_UPDATE', () => {
      const result = user(userBefore, {
        type: REALTIME_GLOBAL_USER_UPDATE,
        user: { ...testUser, name: 'New name' },
      });

      expect(result.frontendPreferences, 'to equal', userBefore.frontendPreferences);
    });

    it('should not touch state on REALTIME_GLOBAL_USER_UPDATE if user is not present', () => {
      const result = user(userBefore, {
        type: REALTIME_GLOBAL_USER_UPDATE,
        user: anotherTestUser,
      });

      expect(result, 'to be', userBefore);
    });
  });

  describe('posts()', () => {
    const testLikeUser = { id: '4' };
    const testLikePost = { id: '1', likes: ['1', '2'] };
    const testLikePosts = { [testLikePost.id]: testLikePost };

    it('should put new "like" to the second position if current user liked the post', () => {
      const newLikeAfterMe = {
        type: REALTIME_LIKE_NEW,
        postId: testLikePost.id,
        iLiked: true,
        users: [testLikeUser],
      };

      const result = posts(testLikePosts, newLikeAfterMe);
      const newPostLikes = result[testLikePost.id].likes;

      expect(newPostLikes, 'to equal', ['1', '4', '2']);
    });

    it(`should put "like" to the first position if current user didn't like the post`, () => {
      const newLikeWithoutMe = {
        type: REALTIME_LIKE_NEW,
        postId: testLikePost.id,
        iLiked: false,
        users: [testLikeUser],
      };

      const result = posts(testLikePosts, newLikeWithoutMe);
      const newPostLikes = result[testLikePost.id].likes;

      expect(newPostLikes, 'to equal', ['4', '1', '2']);
    });

    it('should add post on REALTIME_COMMENT_NEW', () => {
      const newPost = { id: '1' };
      const newTestComment = { postId: newPost.id, id: '2' };
      const newCommentWithPost = {
        type: REALTIME_COMMENT_NEW,
        comment: newTestComment,
        post: { posts: newPost },
      };

      const postsBefore = {};
      const result = posts(postsBefore, newCommentWithPost);

      expect(result, 'to have key', newPost.id);
    });

    it('should add post on REALTIME_LIKE_NEW', () => {
      const newPost = { id: '1' };
      const newLikeWithPost = {
        type: REALTIME_LIKE_NEW,
        users: [{ id: '1' }],
        postId: newPost.id,
        post: { posts: newPost },
      };

      const postsBefore = {};
      const result = posts(postsBefore, newLikeWithPost);

      expect(result, 'to have key', newPost.id);
    });

    it('should hide post on REALTIME_POST_HIDE', () => {
      const state = { '1': { id: '1', isHidden: false } };
      const action = {
        type: REALTIME_POST_HIDE,
        postId: '1',
      };
      const newState = posts(state, action);
      expect(newState['1'], 'to satisfy', { id: '1', isHidden: true });
    });

    it('should not hide missing post on REALTIME_POST_HIDE', () => {
      const state = { '1': { id: '1', isHidden: false } };
      const action = {
        type: REALTIME_POST_HIDE,
        postId: '2',
      };
      const newState = posts(state, action);
      expect(newState, 'to be', state);
    });

    it('should unhide post on REALTIME_POST_UNHIDE', () => {
      const state = { '1': { id: '1', isHidden: true } };
      const action = {
        type: REALTIME_POST_UNHIDE,
        postId: '1',
      };
      const newState = posts(state, action);
      expect(newState['1'], 'to satisfy', { id: '1', isHidden: false });
    });

    it('should not unhide missing post on REALTIME_POST_UNHIDE', () => {
      const state = { '1': { id: '1', isHidden: true } };
      const action = {
        type: REALTIME_POST_UNHIDE,
        postId: '2',
      };
      const newState = posts(state, action);
      expect(newState, 'to be', state);
    });

    describe('REALTIME_COMMENT_DESTROY', () => {
      const state = { post1: { id: 'post1', comments: ['comm1', 'comm2', 'comm3'] } };

      it('should remove comment from post', () => {
        const newState = posts(state, {
          type: REALTIME_COMMENT_DESTROY,
          postId: 'post1',
          commentId: 'comm2',
        });
        expect(newState, 'to equal', { post1: { id: 'post1', comments: ['comm1', 'comm3'] } });
      });

      it('should not change state if comment is not exists', () => {
        const newState = posts(state, {
          type: REALTIME_COMMENT_DESTROY,
          postId: 'post1',
          commentId: 'comm4',
        });
        expect(newState, 'to be', state);
      });

      it('should not change state if post is not exists', () => {
        const newState = posts(state, {
          type: REALTIME_COMMENT_DESTROY,
          postId: 'post2',
          commentId: 'comm2',
        });
        expect(newState, 'to be', state);
      });
    });
  });

  describe('feedViewState()', () => {
    let state;
    beforeEach(() => {
      state = {
        ...feedViewState(undefined, { type: 'init action' }),
        separateHiddenEntries: true,
      };
    });

    describe('on REALTIME_POST_HIDE', () => {
      const action = { type: REALTIME_POST_HIDE, postId: '1' };

      it('should not touch state if post is not on page', () => {
        const newState = feedViewState(state, action);
        expect(newState, 'to be', state);
      });

      it('should not touch state if post is already hidden', () => {
        state = {
          ...state,
          hiddenEntries: [...state.hiddenEntries, '1'],
        };
        const newState = feedViewState(state, action);
        expect(newState, 'to be', state);
      });

      it('should add post to hiddenEntries but also keep it in visibleEntries', () => {
        state = {
          ...state,
          visibleEntries: [...state.visibleEntries, '1'],
        };
        const newState = feedViewState(state, action);
        expect(newState.visibleEntries, 'to be', state.visibleEntries);
        expect(newState.hiddenEntries, 'to contain', '1');
      });
    });

    describe('on REALTIME_POST_UNHIDE', () => {
      const action = { type: REALTIME_POST_UNHIDE, postId: '1' };

      it('should not touch state if post is not on page', () => {
        const newState = feedViewState(state, action);
        expect(newState, 'to be', state);
      });

      it('should not touch state if post is not hidden', () => {
        state = {
          ...state,
          visibleEntries: [...state.visibleEntries, '1'],
        };
        const newState = feedViewState(state, action);
        expect(newState, 'to be', state);
      });

      it('should add post to visibleEntries and remove it from hiddenEntries', () => {
        state = {
          ...state,
          hiddenEntries: [...state.hiddenEntries, '1'],
        };
        const newState = feedViewState(state, action);
        expect(newState.visibleEntries, 'to contain', '1');
        expect(newState.hiddenEntries, 'not to contain', '1');
      });
    });

    describe('on REALTIME_COMMENT_NEW on hidden post', () => {
      const action = {
        type: REALTIME_COMMENT_NEW,
        post: { posts: { id: '1', isHidden: true } },
        shouldBump: true,
      };

      it('should not touch state if post is already hidden', () => {
        state = {
          ...state,
          hiddenEntries: [...state.hiddenEntries, '1'],
        };
        const newState = feedViewState(state, action);
        expect(newState, 'to be', state);
      });

      it('should add post to hiddens if it is not', () => {
        const newState = feedViewState(state, action);
        expect(newState.visibleEntries, 'not to contain', '1');
        expect(newState.hiddenEntries, 'to contain', '1');
      });

      it('should add post to visibles if it is not and separateHiddenEntries is false', () => {
        state = {
          ...state,
          separateHiddenEntries: false,
        };
        const newState = feedViewState(state, action);
        expect(newState.visibleEntries, 'to contain', '1');
        expect(newState.hiddenEntries, 'not to contain', '1');
      });
    });
  });

  describe('postsViewState()', () => {
    const testPost = { id: 1, omittedComments: 1 };
    const postsViewStateBefore = { [testPost.id]: testPost };

    const newRealtimeCommentAction = {
      type: REALTIME_COMMENT_NEW,
      comment: { postId: testPost.id, id: 2 },
    };

    const removeRealtimeCommentAction = {
      type: REALTIME_COMMENT_DESTROY,
      postId: testPost.id,
      commentId: 2,
    };

    it('should raise number of omitted comments on realtime comment', () => {
      const result = postsViewState(postsViewStateBefore, newRealtimeCommentAction);

      expect(result[testPost.id].omittedComments, 'to equal', testPost.omittedComments + 1);
    });

    it('should decrease number of omitted comments on realtime comment deletion', () => {
      const result = postsViewState(postsViewStateBefore, removeRealtimeCommentAction);

      expect(result[testPost.id].omittedComments, 'to equal', testPost.omittedComments - 1);
    });

    it('should not change state on realtime comment deletion if post is not found', () => {
      const result = postsViewState(postsViewStateBefore, {
        ...removeRealtimeCommentAction,
        postId: 42,
      });

      expect(result, 'to be', postsViewStateBefore);
    });

    it('should add post to postsViewState when realtime comment arrives', () => {
      const newPost = { id: '1' };
      const newTestComment = { postId: newPost.id, id: '2' };
      const newCommentWithPost = {
        type: REALTIME_COMMENT_NEW,
        comment: newTestComment,
        post: { posts: newPost },
      };

      const postsViewStateBefore = {};
      const result = postsViewState(postsViewStateBefore, newCommentWithPost);

      expect(result, 'to have key', newPost.id);
    });

    it('should add post to postsViewState when realtime like arrives', () => {
      const newPost = { id: '1' };

      const newLikeWithPost = {
        type: REALTIME_LIKE_NEW,
        users: [{ id: '1' }],
        postId: newPost.id,
        post: { posts: newPost },
      };

      const postsViewStateBefore = {};
      const result = postsViewState(postsViewStateBefore, newLikeWithPost);

      expect(result, 'to have key', newPost.id);
    });
  });

  describe('realtimeSubscriptions()', () => {
    it('should add a new rooms on REALTIME_SUBSCRIBE', () => {
      const state = [];
      const result = realtimeSubscriptions(state, realtimeSubscribe('room1', 'room2'));
      expect(result, 'to equal', ['room1', 'room2']);
    });

    it('should adppend rooms on REALTIME_SUBSCRIBE', () => {
      const state = ['room1'];
      const result = realtimeSubscriptions(state, realtimeSubscribe('room2', 'room3'));
      expect(result, 'to equal', ['room1', 'room2', 'room3']);
    });

    it('should not add a new room if already subscribed', () => {
      const state = ['room1'];
      const result = realtimeSubscriptions(state, realtimeSubscribe('room1'));
      expect(result, 'to be', state);
    });

    it('should remove a room on REALTIME_UNSUBSCRIBE', () => {
      const state = ['room1'];
      const result = realtimeSubscriptions(state, realtimeUnsubscribe('room1'));
      expect(result, 'to equal', []);
    });

    it('should not remove a room if not subscribed', () => {
      const state = ['room1'];
      const result = realtimeSubscriptions(state, realtimeUnsubscribe('room2', 'room3'));
      expect(result, 'to be', state);
    });
  });

  describe('comments()', () => {
    describe('REALTIME_COMMENT_DESTROY', () => {
      const state = { comm1: { id: 'comm1' }, comm2: { id: 'comm2' } };

      it('should remove existing comment', () => {
        const newState = comments(state, {
          type: REALTIME_COMMENT_DESTROY,
          commentId: 'comm2',
        });
        expect(newState, 'to equal', { comm1: { id: 'comm1' } });
      });

      it('should not change state if comment is not exists', () => {
        const newState = comments(state, {
          type: REALTIME_COMMENT_DESTROY,
          commentId: 'comm3',
        });
        expect(newState, 'to be', state);
      });
    });
  });
});
