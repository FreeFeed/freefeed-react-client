import { describe, it } from 'mocha';
import expect from 'unexpected';

import {
  feedViewState,
  posts,
  postsViewState,
  users,
  commentEditState,
} from '../../../../src/redux/reducers';
import { unauthenticated } from '../../../../src/redux/action-creators';

describe('application of "unauthenticated()" action', () => {
  it('should clear "ordinary" reducers', () => {
    const ordinaryReducers = [commentEditState, posts, postsViewState, users];
    const initial = { 1: {}, 2: {} };

    ordinaryReducers.forEach((reducer) => {
      const result = reducer(initial, unauthenticated());
      expect(result, 'to be empty');
    });
  });

  it('should clear feedViewState reducer', () => {
    const initial = { entries: ['1', '2'], isHiddenRevealed: true };

    const feedViewStateReduced = feedViewState(initial, unauthenticated());

    expect(feedViewStateReduced.entries, 'to be empty');
    expect(feedViewStateReduced.isHiddenRevealed, 'to be false');
  });
});
