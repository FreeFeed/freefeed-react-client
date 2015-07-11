import { Store } from 'flummox';
import { Map, List } from 'immutable'
import _ from 'lodash'

class AuthStore extends Store {

  constructor(flux) {
    super() // Don't forget this step

    const actionIds = flux.getActionIds('auth')
    this.register(actionIds.getWhoami, this.handleAuthData)

    this.state = {
      got_response: false,
      server_error: false,
      authenticated: false,
      user: Map(),
      subscribers: List(),
      subscriptions: List()
    };
  }

  handleAuthData(whoami) {
    var data = {
      got_response: true,
    }

    data.server_error = !whoami.ok

    if (whoami.ok) {
      data.authenticated = whoami.authenticated
      if (whoami.authenticated) {
        if (_.isEmpty(whoami.body.users.profilePictureMediumUrl)) {
          whoami.body.users.profilePictureMediumUrl = '/img/default-userpic-48.png'
        }
        if (_.isEmpty(whoami.body.users.profilePictureLargeUrl)) {
          whoami.body.users.profilePictureLargeUrl = '/img/default-userpic-75.png'
        }
        data.user = this.state.user.merge(whoami.body.users)
      }
    }

    this.setState(data)

    if (data.server_error) {

    }
  }

  getUser() {
    return this.state.user
  }
}

export default AuthStore;
