import { describe, it } from 'mocha';
import expect from 'unexpected';

import { joinPostData, ommitBubblesThreshold } from '../../../src/components/select-utils';

const comment1 = { id: 'comment1' };
const comment2 = { id: 'comment2' };
const comment3 = { id: 'comment3' };

const user1 = { id: '1' };
const user2 = { id: '2' };

const post = {
  id: '1',
  comments: [comment1.id, comment2.id, comment3.id],
  postedTo: [],
};

const composeState = ({ subsequentComments, setting, omittedComments = 0, withDelay = false }) => {
  return {
    posts: { [post.id]: { ...post, omittedComments } },
    comments: {
      [comment1.id]: {
        ...comment1,
        createdBy: user1.id,
        createdAt: (0).toString(10),
      },
      [comment2.id]: {
        ...comment2,
        createdBy: subsequentComments ? user1.id : user2.id,
        createdAt: (1000 + (withDelay ? ommitBubblesThreshold : 0)).toString(10),
      },
      [comment3.id]: {
        ...comment3,
        createdBy: user1.id,
        createdAt: (2000 + (withDelay ? ommitBubblesThreshold : 0)).toString(10),
      },
    },
    commentsHighlights: {},
    commentLikes: {},
    commentEditState: {
      [comment1.id]: {},
      [comment2.id]: {},
      [comment3.id]: {},
    },
    postsViewState: { [post.id]: {} },
    user: { frontendPreferences: { comments: { omitRepeatedBubbles: setting } } },
    users: {
      [user1.id]: user1,
      [user2.id]: user2,
    },
    routing: { locationBeforeTransitions: {} },
  };
};

describe('joinPostData()', () => {
  describe('when applied to sequence of comments belonging to single author', () => {
    it('should set omitBubble for subsequent comments when omitRepeatedBubbles is "on"', () => {
      const testState = composeState({ subsequentComments: true, setting: true });
      const result = joinPostData(testState)(post.id);

      expect(result.comments[0].omitBubble, 'to be false');
      expect(result.comments[1].omitBubble, 'to be true');
      expect(result.comments[2].omitBubble, 'to be true');
    });

    it('should not set omitBubble for subsequent comments when omitRepeatedBubbles is "off"', () => {
      const testState = composeState({ subsequentComments: true, setting: false });
      const result = joinPostData(testState)(post.id);

      expect(result.comments[0].omitBubble, 'to be false');
      expect(result.comments[1].omitBubble, 'to be false');
      expect(result.comments[2].omitBubble, 'to be false');
    });

    describe('when middle comment is omitted', () => {
      it('should not set omitBubble even when omitRepeatedBubbles is "on"', () => {
        const testState = composeState({
          subsequentComments: true,
          setting: true,
          omittedComments: 1,
        });
        const result = joinPostData(testState)(post.id);

        expect(result.comments[0].omitBubble, 'to be false');
        expect(result.comments[1].omitBubble, 'to be false');
      });
    });

    describe('when there is a delay between comments', () => {
      it('should not set omitBubble even when omitRepeatedBubbles is "on"', () => {
        const testState = composeState({
          subsequentComments: true,
          setting: true,
          withDelay: true,
        });
        const result = joinPostData(testState)(post.id);

        expect(result.comments[0].omitBubble, 'to be false');
        expect(result.comments[1].omitBubble, 'to be false');
      });
    });
  });

  describe('when comments do not form a sequence belonging to single author', () => {
    it('should not set omitBubble even when omitRepeatedBubbles is "on"', () => {
      const testState = composeState({ subsequentComments: false, setting: true });
      const result = joinPostData(testState)(post.id);

      expect(result.comments[0].omitBubble, 'to be false');
      expect(result.comments[1].omitBubble, 'to be false');
      expect(result.comments[2].omitBubble, 'to be false');
    });
  });
});
