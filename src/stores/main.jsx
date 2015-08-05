import { Store } from 'flummox';
import { Map, List } from 'immutable'
import _ from 'lodash'

import {userParser} from '../helpers/user_parser'

export default class MainStore extends Store {
  constructor(flux) {
    super() // Don't forget this step

    const postsIds = flux.getActionIds('posts')
    const authIds  = flux.getActionIds('auth')

    this.register(postsIds.getHome,  this.handleHome)
    this.register(authIds.getWhoami, this.handleAuthData)

    this.state = {
      got_response: false,
      server_error: false,
      authenticated: false,
      me: {
        user: Map(),
        subscribers: List(),
        subscriptions: List()
      },
      home: List(),
      posts: Map(),
      users: Map()
    };
  }

  handleHome(home_data) {
    var data = {
      got_response: true,
    }

    data.server_error = !home_data.ok

    if (home_data.ok) {
      data.authenticated = home_data.authenticated
      if (home_data.authenticated) {
        let posts = home_data.body.posts

        if (_.isUndefined(posts)) {
          return
        }

        let ids = posts.map((post) => post.id)
        let indexed_posts = _.indexBy(posts, 'id')

        data.posts = this.state.posts.merge(indexed_posts)
        data.home = ids
        data.users = this.state.users.merge(_.indexBy(home_data.body.users.map(userParser), 'id'))
      }
    }

    this.setState(data)
  }

  handleAuthData(whoami) {
    var data = {
      got_response: true,
      me: {}
    }

    data.server_error = !whoami.ok

    if (whoami.ok) {
      data.authenticated = whoami.authenticated

      if (whoami.authenticated) {
        data.me.user = this.state.me.user.merge(userParser(whoami.body.users))
      }
    }

    this.setState(data)
  }

  getUser() {
    if (!this.state.authenticated) {
      return null
    }

    return this.state.me.user
  }
}
