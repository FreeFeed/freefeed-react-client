import { Store } from 'flummox';
import { Map, List } from 'immutable'
import _ from 'lodash'

import {userParser} from '../helpers/user_parser'

export default class PostsStore extends Store {

  constructor(flux) {
    super() // Don't forget this step

    const postsIds = flux.getActionIds('posts')
    this.register(postsIds.getHome, this.handleHome)

    this.state = {
      got_response: false,
      server_error: false,
      authenticated: false,
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
}
