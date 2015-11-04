import test from 'tape'
import {commentViewState, feedViewState, posts, postsViewState, users} from 'src/redux/reducers'
import {unauthenticated} from 'src/redux/action-creators'

test('unauthenticated action clears reducer state', t => {

  const ordinaryReducers = [commentViewState, posts, postsViewState, users]

  const ordinaryReducersReduced = ordinaryReducers.map(reducer => reducer({'1':{},'2':{}}, unauthenticated()))

  ordinaryReducersReduced.forEach(reducedResult => t.equal(Object.keys(reducedResult).length, 0))

  const feedViewStateReduced = feedViewState({feed: ['1','2']}, unauthenticated())
  t.equal(feedViewStateReduced.feed.length, 0)

  t.end()
})
