export function getCookie(name){
  const begin = document.cookie.indexOf(name)
  if (begin === -1){
    return ''
  }
  const fromBegin = document.cookie.substr(begin)
  const tokenWithName = fromBegin.split(';')
  const tokenWithNameSplit = tokenWithName[0].split('=')
  const token = tokenWithNameSplit[1]
  return token.trim()
}

import moment from 'moment'

export function fromNowOrNow(date) {
  var now = moment(date)

  if (Math.abs(moment().diff(now)) < 1000) { // 1000 milliseconds
    return 'just now'
  }

  return now.fromNow()
}

import _ from 'lodash'

import defaultUserpic48Path from 'assets/images/default-userpic-48.png'
import defaultUserpic75Path from 'assets/images/default-userpic-75.png'

export function userParser(user) {
  if (_.isEmpty(user.profilePictureMediumUrl)) {
    user.profilePictureMediumUrl = defaultUserpic48Path
  }
  if (_.isEmpty(user.profilePictureLargeUrl)) {
    user.profilePictureLargeUrl = defaultUserpic75Path
  }

  return user
}


export function preventDefault(realFunction) {
  return (event) => {
    event.preventDefault()
    return realFunction && realFunction()
  }
}