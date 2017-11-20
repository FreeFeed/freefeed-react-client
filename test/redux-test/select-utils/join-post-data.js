import test from 'tape';

import {joinPostData, ommitBubblesThreshold} from '../../../src/components/select-utils';

const comment1 = {
  id: 'comment1'
};

const comment2 = {
  id: 'comment2'
};

const comment3 = {
  id: 'comment3'
};

const user1 = {
  id: '1'
};

const user2 = {
  id: '2'
};

const post = {
  id: '1',
  comments: [comment1.id, comment2.id, comment3.id],
  postedTo: [],
};

const composeState = ({subsequentComments, setting, omittedComments = 0, withDelay = false}) => {
  return {
    posts: {
      [post.id] : post
    },
    comments: {
      [comment1.id]: {
        ...comment1,
        createdBy: user1.id,
        createdAt: (0).toString(10)
      },
      [comment2.id]: {
        ...comment2,
        createdBy: subsequentComments ? user1.id : user2.id,
        createdAt: (1000 + (withDelay ? ommitBubblesThreshold : 0)).toString(10)
      },
      [comment3.id]: {
        ...comment3,
        createdBy: user1.id,
        createdAt: (2000 + (withDelay ? ommitBubblesThreshold : 0)).toString(10)
      }
    },
    commentsHighlights: {},
    commentLikes: {},
    commentViewState: {
      [comment1.id]: {},
      [comment2.id]: {},
      [comment3.id]: {},
    },
    postsViewState: {
      [post.id]:{omittedComments}
    },
    user: {
      frontendPreferences: {
        comments: {
          omitRepeatedBubbles: setting
        }
      }
    },
    users: {
      [user1.id]: user1,
      [user2.id]: user2,
    },
    routing: {
      locationBeforeTransitions: {
      }
    }
  };
};

test('joinPostData sets omitBubble for subsequent comments with setting on', (t) => {
  const testState = composeState({subsequentComments: true, setting: true});

  const result = joinPostData(testState)(post.id);

  t.notOk(result.comments[0].omitBubble);
  t.ok(result.comments[1].omitBubble);
  t.ok(result.comments[2].omitBubble);

  t.end();
});

test('joinPostData doesn\'t set omitBubble for subsequent comments with setting off', (t) => {
  const testState = composeState({subsequentComments: true, setting: false});

  const result = joinPostData(testState)(post.id);

  t.notOk(result.comments[0].omitBubble);
  t.notOk(result.comments[1].omitBubble);
  t.notOk(result.comments[2].omitBubble);

  t.end();
});

test('joinPostData doesn\'t set omitBubble for non-subsequent comments with setting on', (t) => {
  const testState = composeState({subsequentComments: false, setting: true});

  const result = joinPostData(testState)(post.id);

  t.notOk(result.comments[0].omitBubble);
  t.notOk(result.comments[1].omitBubble);
  t.notOk(result.comments[2].omitBubble);

  t.end();
});

test('joinPostData doesn\'t set omitBubble for subsequent comments with setting on and non-zero omitted comments', (t) => {
  const testState = composeState({subsequentComments: true, setting: true, omittedComments: 1});

  const result = joinPostData(testState)(post.id);

  t.notOk(result.comments[0].omitBubble);
  t.notOk(result.comments[1].omitBubble);

  t.end();
});

test('joinPostData doesn\'t set omitBubble for subsequent comments with delay between them', (t) => {
  const testState = composeState({subsequentComments: true, setting: true, withDelay: true});

  const result = joinPostData(testState)(post.id);

  t.notOk(result.comments[0].omitBubble);
  t.notOk(result.comments[1].omitBubble);

  t.end();
});
