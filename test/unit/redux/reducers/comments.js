import { describe, it } from 'mocha';
import expect from 'unexpected';
import {
  ADD_COMMENT,
  COMPLETE_POST_COMMENTS,
  DELETE_COMMENT,
  REALTIME_COMMENT_DESTROY,
  REALTIME_COMMENT_NEW,
  REALTIME_COMMENT_UPDATE,
  SHOW_MORE_COMMENTS,
} from '../../../../src/redux/action-types';
import { initialAsyncState, response } from '../../../../src/redux/async-helpers';
import { posts } from '../../../../src/redux/reducers';
import { postParser } from '../../../../src/utils';

describe('comments-related data', () => {
  describe('postParser()', () => {
    const emptyPostState = {
      comments: [],
      omittedComments: 0,
      commentsDisabled: false,
      savePostStatus: initialAsyncState,
      omittedCommentsOffset: 0,
    };

    it(`should parse post without comments`, () => {
      expect(postParser({ id: 'post', comments: [], omittedComments: 0 }), 'to equal', {
        ...emptyPostState,
        id: 'post',
      });
    });

    it(`should parse post with unfolded comments`, () => {
      expect(postParser({ id: 'post', comments: ['c1', 'c2'], omittedComments: 0 }), 'to equal', {
        ...emptyPostState,
        id: 'post',
        comments: ['c1', 'c2'],
      });
    });

    it(`should parse post with folded comments`, () => {
      expect(postParser({ id: 'post', comments: ['c1', 'c2'], omittedComments: 3 }), 'to equal', {
        ...emptyPostState,
        id: 'post',
        comments: ['c1', 'c2'],
        omittedComments: 3,
        omittedCommentsOffset: 1,
      });
    });
  });

  describe('posts()', () => {
    const state = {
      post0: postParser({
        id: 'post0',
        comments: [],
        omittedComments: 0,
        omittedCommentLikes: 0,
      }),
      post1: postParser({
        id: 'post1',
        comments: ['comm11', 'comm12'],
        omittedComments: 0,
        omittedCommentLikes: 0,
      }),
      post2: postParser({
        id: 'post2',
        comments: ['comm21', 'comm22'],
        omittedComments: 2,
        omittedCommentLikes: 2,
      }),
    };

    describe('ADD_COMMENT', () => {
      const action = (postId, commentId) => ({
        type: response(ADD_COMMENT),
        payload: { comments: { id: commentId } },
        request: { postId },
      });

      it('should add a comment to post0', () => {
        const newState = posts(state, action('post0', 'comm3'));
        expect(newState, 'to equal', {
          ...state,
          post0: {
            ...state['post0'],
            comments: ['comm3'],
          },
        });
      });

      it('should add a comment to post1', () => {
        const newState = posts(state, action('post1', 'comm3'));
        expect(newState, 'to equal', {
          ...state,
          post1: {
            ...state['post1'],
            comments: ['comm11', 'comm12', 'comm3'],
          },
        });
      });

      it('should add a comment to post2 and shouldnt touch it omittedComments', () => {
        const newState = posts(state, action('post2', 'comm3'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm21', 'comm22', 'comm3'],
          },
        });
      });

      it('shouldnt touch state for unknown post', () => {
        const newState = posts(state, action('post3', 'comm3'));
        expect(newState, 'to be', state);
      });

      it('shouldnt touch state if the post already includes a comment', () => {
        const newState = posts(state, action('post1', 'comm12'));
        expect(newState, 'to be', state);
      });
    });

    describe('REALTIME_COMMENT_NEW', () => {
      const action = (postId, commentId, postObj) => ({
        type: REALTIME_COMMENT_NEW,
        comment: { id: commentId, postId },
        ...(postObj && { post: { posts: postObj } }),
      });

      it('should add a comment to post0', () => {
        const newState = posts(state, action('post0', 'comm3'));
        expect(newState, 'to equal', {
          ...state,
          post0: {
            ...state['post0'],
            comments: ['comm3'],
          },
        });
      });

      it('should add a comment to post1', () => {
        const newState = posts(state, action('post1', 'comm3'));
        expect(newState, 'to equal', {
          ...state,
          post1: {
            ...state['post1'],
            comments: ['comm11', 'comm12', 'comm3'],
          },
        });
      });

      it('should add a comment to post2 and shouldnt touch it omittedComments', () => {
        const newState = posts(state, action('post2', 'comm3'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm21', 'comm22', 'comm3'],
          },
        });
      });

      it('should add new post to the state', () => {
        const newState = posts(
          state,
          action('post3', 'comm3', { id: 'post3', comments: ['comm3'], omittedComments: 0 }),
        );
        expect(newState, 'to equal', {
          ...state,
          post3: postParser({
            id: 'post3',
            comments: ['comm3'],
            omittedComments: 0,
          }),
        });
      });

      it('shouldnt touch state if the post already includes a comment', () => {
        const newState = posts(state, action('post1', 'comm12'));
        expect(newState, 'to be', state);
      });
    });

    describe('REALTIME_COMMENT_UPDATE', () => {
      const action = (event, postId, commentId, likes = 0, postObj = null) => ({
        type: REALTIME_COMMENT_UPDATE,
        comment: { id: commentId, likes, postId },
        event,
        ...(postObj && { post: { posts: postObj } }),
      });

      it('should not change state if the comment not found and the post has no collapsed comments', () => {
        const newState = posts(state, action('comment_like:new', 'post0', 'comm3'));
        expect(newState, 'to be', state);
      });

      it('should not change state if comment is found in the post comments', () => {
        const newState = posts(state, action('comment_like:new', 'post1', 'comm11'));
        expect(newState, 'to be', state);
      });

      it(`should increase omittedCommentLikes on 'comment_like:new' if the comment not found and the post has collapsed comments`, () => {
        const newState = posts(state, action('comment_like:new', 'post2', 'post23'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            omittedCommentLikes: state['post2'].omittedCommentLikes + 1,
          },
        });
      });

      it(`should decrease omittedCommentLikes on 'comment_like:remove' if the comment not found and the post has collapsed comments`, () => {
        const newState = posts(state, action('comment_like:remove', 'post2', 'post23'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            omittedCommentLikes: state['post2'].omittedCommentLikes - 1,
          },
        });
      });
    });

    describe('DELETE_COMMENT', () => {
      const action = (commentId, postId) => ({
        type: response(DELETE_COMMENT),
        request: { commentId, postId },
      });

      it('should delete comment from post1', () => {
        const newState = posts(state, action('comm11', 'post1'));
        expect(newState, 'to equal', {
          ...state,
          post1: {
            ...state['post1'],
            comments: ['comm12'],
          },
        });
      });

      it('should delete first comment from post2', () => {
        const newState = posts(state, action('comm21', 'post2'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm22'],
            omittedCommentsOffset: 0,
          },
        });
      });

      it('should delete last comment from post2', () => {
        const newState = posts(state, action('comm22', 'post2'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm21'],
            omittedCommentsOffset: 1,
          },
        });
      });

      it('shouldnt touch state if comment is unknown', () => {
        const newState = posts(state, action('comm3', 'post2'));
        expect(newState, 'to be', state);
      });
    });

    describe('REALTIME_COMMENT_DESTROY', () => {
      const action = (commentId, postId) => ({
        type: REALTIME_COMMENT_DESTROY,
        commentId,
        postId,
      });

      it('should delete comment from post1', () => {
        const newState = posts(state, action('comm11', 'post1'));
        expect(newState, 'to equal', {
          ...state,
          post1: {
            ...state['post1'],
            comments: ['comm12'],
          },
        });
      });

      it('should delete first comment from post2', () => {
        const newState = posts(state, action('comm21', 'post2'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm22'],
            omittedCommentsOffset: 0,
          },
        });
      });

      it('should delete last comment from post2', () => {
        const newState = posts(state, action('comm22', 'post2'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm21'],
            omittedCommentsOffset: 1,
          },
        });
      });

      it('shouldnt touch state if post is unknown', () => {
        const newState = posts(state, action('comm55', 'post5'));
        expect(newState, 'to be', state);
      });

      it('shouldnt touch state if comment is unknown and post has no omittedComments', () => {
        const newState = posts(state, action('comm13', 'post1'));
        expect(newState, 'to be', state);
      });

      it('should decrease omittedComments if comment is unknown', () => {
        const newState = posts(state, action('comm23', 'post2'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            omittedComments: state['post2'].omittedComments - 1,
          },
        });
      });
    });

    describe('SHOW_MORE_COMMENTS', () => {
      const action = (postId, comments) => ({
        type: response(SHOW_MORE_COMMENTS),
        payload: { posts: { id: postId, comments, omittedComments: 0 } },
      });

      it('should expand comments of post2', () => {
        const newState = posts(state, action('post2', ['comm21', 'comm22', 'comm23']));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            omittedComments: 0,
            omittedCommentsOffset: 0,
            comments: ['comm21', 'comm22', 'comm23'],
          },
        });
      });

      it('should rewrite comments of post1', () => {
        const newState = posts(state, action('post1', ['comm11', 'comm12', 'comm13']));
        expect(newState, 'to equal', {
          ...state,
          post1: {
            ...state['post1'],
            omittedComments: 0,
            omittedCommentsOffset: 0,
            comments: ['comm11', 'comm12', 'comm13'],
          },
        });
      });

      it('shouldnt touch state if post is unknown', () => {
        const newState = posts(state, action('post5', ['comm11', 'comm12', 'comm13']));
        expect(newState, 'to be', state);
      });
    });

    describe('COMPLETE_POST_COMMENTS', () => {
      const action = (postId, comments, omittedComments) => ({
        type: response(COMPLETE_POST_COMMENTS),
        payload: { posts: { id: postId, comments, omittedComments } },
      });

      it(`should complete a missing first comment`, () => {
        const state = {
          post: {
            id: 'post',
            comments: ['c4'],
            omittedComments: 2,
            omittedCommentsOffset: 0,
          },
        };
        const newState = posts(state, action('post', ['c1', 'c4'], 2));
        expect(newState, 'to equal', {
          post: {
            ...state['post'],
            omittedComments: 2,
            omittedCommentsOffset: 1,
            comments: ['c1', 'c4'],
          },
        });
      });

      it(`should complete a missing first and last comments`, () => {
        const state = {
          post: {
            id: 'post',
            comments: [],
            omittedComments: 2,
            omittedCommentsOffset: 0,
          },
        };
        const newState = posts(state, action('post', ['c1', 'c4'], 2));
        expect(newState, 'to equal', {
          post: {
            ...state['post'],
            omittedComments: 2,
            omittedCommentsOffset: 1,
            comments: ['c1', 'c4'],
          },
        });
      });

      it(`should complete a missing first comment but keep extra tail comments`, () => {
        const state = {
          post: {
            id: 'post',
            comments: ['c4', 'c5'],
            omittedComments: 3,
            omittedCommentsOffset: 0,
          },
        };
        const newState = posts(state, action('post', ['c1', 'c5'], 3));
        expect(newState, 'to equal', {
          post: {
            ...state['post'],
            omittedComments: 2,
            omittedCommentsOffset: 1,
            comments: ['c1', 'c4', 'c5'],
          },
        });
      });

      it(`should rewrite first or tail comments if they are mismatched`, () => {
        const state = {
          post: {
            id: 'post',
            comments: ['c1', 'c4', 'c5'],
            omittedComments: 2,
            omittedCommentsOffset: 1,
          },
        };
        const newState = posts(state, action('post', ['c11', 'c51'], 3));
        expect(newState, 'to equal', {
          post: {
            ...state['post'],
            omittedComments: 3,
            omittedCommentsOffset: 1,
            comments: ['c11', 'c51'],
          },
        });
      });

      it(`should rewrite comments if the received comments is expanded`, () => {
        const state = {
          post: {
            id: 'post',
            comments: ['c3'],
            omittedComments: 2,
            omittedCommentsOffset: 0,
          },
        };
        const newState = posts(state, action('post', ['c1', 'c2', 'c3'], 0));
        expect(newState, 'to equal', {
          post: {
            ...state['post'],
            omittedComments: 0,
            omittedCommentsOffset: 0,
            comments: ['c1', 'c2', 'c3'],
          },
        });
      });

      it(`should not touch state if it is already expanded`, () => {
        const state = {
          post: {
            id: 'post',
            comments: ['c1', 'c2', 'c3'],
            omittedComments: 0,
            omittedCommentsOffset: 0,
          },
        };
        const newState = posts(state, action('post', ['c1', 'c3'], 1));
        expect(newState, 'to be', state);
      });
    });
  });
});
