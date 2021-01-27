import { describe, it } from 'mocha';
import expect from 'unexpected';
import {
  ADD_COMMENT,
  DELETE_COMMENT,
  REALTIME_COMMENT_DESTROY,
  REALTIME_COMMENT_NEW,
  SHOW_MORE_COMMENTS,
} from '../../../../src/redux/action-types';
import { response } from '../../../../src/redux/async-helpers';
import { posts } from '../../../../src/redux/reducers';
import { postParser } from '../../../../src/utils';

describe('comments-related data', () => {
  describe('posts()', () => {
    const state = {
      post0: {
        id: 'post0',
        comments: [],
        omittedComments: 0,
      },
      post1: {
        id: 'post1',
        comments: ['comm11', 'comm12'],
        omittedComments: 0,
      },
      post2: {
        id: 'post2',
        comments: ['comm21', 'comm22'],
        omittedComments: 2,
      },
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

    describe('DELETE_COMMENT', () => {
      const action = (commentId) => ({
        type: response(DELETE_COMMENT),
        request: { commentId },
      });

      it('should delete comment from post1', () => {
        const newState = posts(state, action('comm11'));
        expect(newState, 'to equal', {
          ...state,
          post1: {
            ...state['post1'],
            comments: ['comm12'],
          },
        });
      });

      it('should delete first comment from post2', () => {
        const newState = posts(state, action('comm21'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm22'],
          },
        });
      });

      it('should delete second comment from post2', () => {
        const newState = posts(state, action('comm22'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm21'],
          },
        });
      });

      it('shouldnt touch state if comment is unknown', () => {
        const newState = posts(state, action('comm3'));
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
          },
        });
      });

      it('should delete second comment from post2', () => {
        const newState = posts(state, action('comm22', 'post2'));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            comments: ['comm21'],
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
        payload: { posts: { id: postId, comments } },
      });

      it('should expand comments of post2', () => {
        const newState = posts(state, action('post2', ['comm21', 'comm22', 'comm23']));
        expect(newState, 'to equal', {
          ...state,
          post2: {
            ...state['post2'],
            omittedComments: 0,
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
            comments: ['comm11', 'comm12', 'comm13'],
          },
        });
      });

      it('shouldnt touch state if post is unknown', () => {
        const newState = posts(state, action('post5', ['comm11', 'comm12', 'comm13']));
        expect(newState, 'to be', state);
      });
    });
  });
});
