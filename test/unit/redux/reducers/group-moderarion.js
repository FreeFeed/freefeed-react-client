import { describe, it, beforeEach } from 'mocha';
import expect from 'unexpected';

import { feedViewState, posts } from '../../../../src/redux/reducers';
import { response } from '../../../../src/redux/action-helpers';
import { DELETE_POST, REALTIME_POST_UPDATE } from '../../../../src/redux/action-types';

describe('Group moderation', () => {
  describe('feedViewState', () => {
    let state, action;
    beforeEach(() => {
      state = {
        ...feedViewState(undefined, { type: 'init' }),
        visibleEntries: ['post1', 'post2', 'post3'],
        hiddenEntries:  ['post1', 'post2'],
      };
      action = {
        type:    response(DELETE_POST),
        payload: { postStillAvailable: false },
        request: { postId: 'post2' },
      };
    });

    it('should remove post from feedViewState if it is fully deleted', () => {
      const newState = feedViewState(state, action);
      expect(newState.visibleEntries, 'to equal', ['post1', 'post3']);
      expect(newState.hiddenEntries, 'to equal', ['post1']);
    });

    it('should not remove post from feedViewState if it is not fully deleted', () => {
      action.payload.postStillAvailable = true;
      const newState = feedViewState(state, action);
      expect(newState, 'to equal', state);
    });
  });

  describe('posts', () => {
    let state, action;
    beforeEach(() => {
      state = {
        // ...posts(undefined, { type: 'init' }),
        'post1': {
          id:          'post1',
          body:        'body',
          updatedAt:   'updatedAt',
          attachments: [],
          postedTo:    ['feed1', 'feed2'],
        },
      };
      action = {
        type: REALTIME_POST_UPDATE,
        post: {
          id:          'post1',
          body:        'new body',
          updatedAt:   'new updatedAt',
          attachments: ['att1'],
          postedTo:    ['feed1', 'feed2', 'feed3'],
        },
      };
    });

    it('should update postedTo field of post on REALTIME_POST_UPDATE', () => {
      const newState = posts(state, action);
      expect(newState['post1'], 'to equal', action.post);
    });
  });
});
