import {home, discussions, direct, getUserFeed, getSinglePost} from './action-creators'

const scrollToTop = value => {
  scrollTo(0, 0)
  return value
}

//query params are strings, so + hack to convert to number
const getOffset = nextRoute => +nextRoute.location.query.offset || 0

export const routeActions = {
  'home': next => scrollToTop(home(getOffset(next))),
  'discussions': next => scrollToTop(discussions(getOffset(next))),
  'userFeed': next => scrollToTop(getUserFeed(next.params.userName, getOffset(next))),
  'post': next => scrollToTop(getSinglePost(next.params.postId)),
  'direct': next => scrollToTop(direct(getOffset(next))),
}

export const bindRouteActions = dispatch => route => next => {
  return dispatch(routeActions[route](next))
}
