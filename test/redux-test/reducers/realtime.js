import test from 'tape';

import { postsViewState, users, posts } from '../../../src/redux/reducers';
import { REALTIME_COMMENT_NEW, REALTIME_COMMENT_DESTROY, REALTIME_LIKE_NEW, REALTIME_POST_NEW } from '../../../src/redux/action-types';

const testPost = {
  id: 1,
  omittedComments: 1,
};

const postsViewStateBefore = { [testPost.id]: testPost };

const newRealtimeCommentAction = {
  type: REALTIME_COMMENT_NEW,
  comment: {
    postId: testPost.id,
    id: 2,
  },
};

const removeRealtimeCommentAction = {
  type: REALTIME_COMMENT_DESTROY,
  postId: testPost.id,
  commentId: 2,
};

test('number of omitted comments raised by new realtime comment', (t) => {
  const result = postsViewState(postsViewStateBefore, newRealtimeCommentAction);

  t.equal(result[testPost.id].omittedComments, testPost.omittedComments + 1);

  t.end();
});

test('number of omitted comments decreased by realtime comment deletion', (t) => {
  const result = postsViewState(postsViewStateBefore, removeRealtimeCommentAction);

  t.equal(result[testPost.id].omittedComments, testPost.omittedComments - 1);

  t.end();
});

const testUser = {
  id: 1,
  name: 'Ururu'
};

const usersBefore = { [testUser.id]: testUser };

test('new post doesn\'t add user if presented', (t) => {
  const result = users(usersBefore, {
    type: REALTIME_POST_NEW,
    users: [{ id: 1 }],
  });

  t.equal(result[testUser.id], testUser);

  t.end();
});

test('new comment doesn\'t add user if presented', (t) => {
  const result = users(usersBefore, {
    type: REALTIME_COMMENT_NEW,
    users: [{ id: 1 }],
  });

  t.equal(result[testUser.id], testUser);

  t.end();
});

test('new like doesn\'t add user if presented', (t) => {
  const result = users(usersBefore, {
    type: REALTIME_LIKE_NEW,
    users: [{ id: 1 }],
  });

  t.equal(result[testUser.id], testUser);

  t.end();
});


const anotherTestUser = {
  id: 2,
  name: 'Arara',
};

test('new post adds user if not presented', (t) => {
  const result = users(usersBefore, {
    type: REALTIME_POST_NEW,
    users: [anotherTestUser],
  });

  //as we know, user data is processed with some parsing, so link doesn't remain the same
  t.equal(result[anotherTestUser.id].name, anotherTestUser.name);

  t.end();
});

test('new comment adds user if not presented', (t) => {
  const result = users(usersBefore, {
    type: REALTIME_COMMENT_NEW,
    users: [anotherTestUser],
  });

  t.equal(result[anotherTestUser.id].name, anotherTestUser.name);

  t.end();
});

test('new like adds user if not presented', (t) => {
  const result = users(usersBefore, {
    type: REALTIME_LIKE_NEW,
    users: [anotherTestUser],
  });

  t.equal(result[anotherTestUser.id].name, anotherTestUser.name);

  t.end();
});

const testLikePost = {
  id: '1',
  likes: ['1', '2']
};

const testLikeUser = {
  id: '4'
};

const testLikePosts = {
  [testLikePost.id]: testLikePost
};

test('new like adds after me if I liked the post', (t) => {
  const newLikeAfterMe = {
    type: REALTIME_LIKE_NEW,
    postId: testLikePost.id,
    iLiked: true,
    users: [testLikeUser]
  };

  const result = posts(testLikePosts, newLikeAfterMe);
  const newPostLikes = result[testLikePost.id].likes;

  t.equal(newPostLikes.length, testLikePost.likes.length + 1);
  t.notEqual(newPostLikes[0], testLikeUser.id);
  t.equal(newPostLikes[1], testLikeUser.id);
  t.end();
});

test('new like adds at first position if I didn\'t like the post', (t) => {
  const newLikeWithoutMe = {
    type: REALTIME_LIKE_NEW,
    postId: testLikePost.id,
    iLiked: false,
    users: [testLikeUser]
  };

  const result = posts(testLikePosts, newLikeWithoutMe);
  const newPostLikes = result[testLikePost.id].likes;

  t.equal(newPostLikes.length, testLikePost.likes.length + 1);
  t.equal(newPostLikes[0], testLikeUser.id);
  t.notEqual(newPostLikes[1], testLikeUser.id);
  t.end();
});

test('new comment with post attached adds postViewState for the post', (t) => {
  const newPost = {
    id: '1'
  };
  const newTestComment = {
    postId: newPost.id,
    id: '2'
  };
  const newCommentWithPost = {
    type: REALTIME_COMMENT_NEW,
    comment: newTestComment,
    post: { posts: newPost }
  };

  const postsViewStateBefore = {};

  const result = postsViewState(postsViewStateBefore, newCommentWithPost);

  t.ok(result[newPost.id]);

  t.end();
});

test('new comment with post attached adds post to the posts', (t) => {
  const newPost = {
    id: '1'
  };
  const newTestComment = {
    postId: newPost.id,
    id: '2'
  };
  const newCommentWithPost = {
    type: REALTIME_COMMENT_NEW,
    comment: newTestComment,
    post: { posts: newPost }
  };

  const postsBefore = {};

  const result = posts(postsBefore, newCommentWithPost);

  t.ok(result[newPost.id]);

  t.end();
});

test('new like with post attached adds postViewState for the post', (t) => {
  const newPost = {
    id: '1'
  };

  const newLikeWithPost = {
    type: REALTIME_LIKE_NEW,
    users: [{ id:'1' }],
    postId: newPost.id,
    post: { posts: newPost }
  };

  const postsViewStateBefore = {};

  const result = postsViewState(postsViewStateBefore, newLikeWithPost);

  t.ok(result[newPost.id]);

  t.end();
});

test('new like with post attached adds post to the posts', (t) => {
  const newPost = {
    id: '1',
  };
  const newLikeWithPost = {
    type: REALTIME_LIKE_NEW,
    users: [{ id:'1' }],
    postId: newPost.id,
    post: { posts: newPost }
  };

  const postsBefore = {};

  const result = posts(postsBefore, newLikeWithPost);

  t.ok(result[newPost.id]);

  t.end();
});
