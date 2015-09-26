import _ from 'lodash'

export function userParser(user) {
  if (_.isEmpty(user.profilePictureMediumUrl)) {
    user.profilePictureMediumUrl = '/img/default-userpic-48.png'
  }
  if (_.isEmpty(user.profilePictureLargeUrl)) {
    user.profilePictureLargeUrl = '/img/default-userpic-75.png'
  }

  return user
}
