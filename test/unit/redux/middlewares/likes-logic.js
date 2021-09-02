import { describe, it, beforeEach } from 'mocha';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';
import { spy } from 'sinon';

import { likesLogicMiddleware } from '../../../../src/redux/middlewares';
import { REALTIME_LIKE_REMOVE } from '../../../../src/redux/action-types';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

describe('likesLogicMiddleware middleware', () => {
  describe('on REALTIME_LIKE_REMOVE', () => {
    const store = {
      posts: {},
      getState() {
        return this;
      },
    };
    const next = spy();
    let action;

    beforeEach(() => {
      store.posts = {};
      action = {
        type: REALTIME_LIKE_REMOVE,
        postId: '111',
        userId: '222',
      };
      next.resetHistory();
    });

    it('should add isLikeVisible: false if post not in store', () => {
      store.posts = {};
      const nextAction = { ...action, isLikeVisible: false };

      likesLogicMiddleware(store)(next)(action);
      expect(next, 'to have a call satisfying', { args: [nextAction] });
    });

    it('should add isLikeVisible: false if user was not like post', () => {
      store.posts = { 111: { likes: ['333'] } };
      const nextAction = { ...action, isLikeVisible: false };

      likesLogicMiddleware(store)(next)(action);
      expect(next, 'to have a call satisfying', { args: [nextAction] });
    });

    it('should add isLikeVisible: true if user was like post', () => {
      store.posts = { 111: { likes: ['333', '222'] } };
      const nextAction = { ...action, isLikeVisible: true };

      likesLogicMiddleware(store)(next)(action);
      expect(next, 'to have a call satisfying', { args: [nextAction] });
    });
  });
});
