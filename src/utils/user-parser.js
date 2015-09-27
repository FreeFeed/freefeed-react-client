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
