import { describe, it } from 'vitest';
import expect from 'unexpected';

import { REFRESH_VISIBLE_POSTS } from '../../../../src/redux/action-types';
import { response } from '../../../../src/redux/async-helpers';
import { comments, posts, postsViewState } from '../../../../src/redux/reducers';

describe('visible posts refresh', () => {
  const action = {
    type: response(REFRESH_VISIBLE_POSTS),
    payload: {
      posts: [
        {
          id: 'post1',
          body: 'Updated post',
          comments: ['comment1'],
          likes: ['user1'],
          omittedLikes: 5,
        },
      ],
      comments: [{ id: 'comment1', body: 'New comment' }],
    },
  };

  it('should preserve local post view state', () => {
    const state = {
      post1: {
        id: 'post1',
        omittedLikes: 3,
        isCommenting: true,
        isEditing: true,
        newCommentText: 'Draft text',
      },
    };

    expect(postsViewState(state, action).post1, 'to equal', {
      ...state.post1,
      omittedLikes: 5,
    });
  });

  it('should still update post and comment data', () => {
    expect(posts({}, action).post1, 'to satisfy', {
      body: 'Updated post',
      comments: ['comment1'],
      likes: ['user1'],
    });
    expect(comments({}, action).comment1, 'to equal', action.payload.comments[0]);
  });
});
