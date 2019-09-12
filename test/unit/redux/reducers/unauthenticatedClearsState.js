import { describe, it } from 'mocha';
import expect from 'unexpected';

import {
  commentViewState,
  feedViewState,
  posts,
  postsViewState,
  users,
} from '../../../../src/redux/reducers';
import { unauthenticated } from '../../../../src/redux/action-creators';

describe('application of "unauthenticated()" action', () => {
  it('should clear "ordinary" reducers', () => {
    const ordinaryReducers = [commentViewState, posts, postsViewState, users];
    const initial = { '1': {}, '2': {} };

    ordinaryReducers.forEach((reducer) => {
      const result = reducer(initial, unauthenticated());
      expect(result, 'to be empty');
    });
  });

  it('should clear feedViewState reducer', () => {
    const initial = {
      visibleEntries: ['1', '2'],
      hiddenEntries: ['3', '4'],
      isHiddenRevealed: true,
    };

    const feedViewStateReduced = feedViewState(initial, unauthenticated());

    expect(feedViewStateReduced.visibleEntries, 'to be empty');
    expect(feedViewStateReduced.hiddenEntries, 'to be empty');
    expect(feedViewStateReduced.isHiddenRevealed, 'to be false');
  });
});
