import test from 'tape'
import {postsViewState} from 'src/redux/reducers'
import {REALTIME_COMMENT_NEW, REALTIME_COMMENT_DESTROY} from 'src/redux/action-types'

const testPost = {
  id: 1,
  omittedComments: 1,
}

const stateBefore = {[testPost.id]: testPost}


const newRealtimeCommentAction = {
  type: REALTIME_COMMENT_NEW,
  comment: {
    postId: testPost.id,
    id: 2,
  },
}

const removeRealtimeCommentAction = {
  type: REALTIME_COMMENT_DESTROY,
  postId: testPost.id,
  commentId: 2,
}

test('number of omitted comments raised by new realtime comment', t => {
  const result = postsViewState(stateBefore, newRealtimeCommentAction)

  t.equal(result[testPost.id].omittedComments, testPost.omittedComments + 1)

  t.end()
})

test('number of omitted comments decreased by realtime comment deletion', t => {
  const result = postsViewState(stateBefore, removeRealtimeCommentAction)

  t.equal(result[testPost.id].omittedComments, testPost.omittedComments - 1)

  t.end()
})
