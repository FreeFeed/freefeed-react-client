import {Flux} from 'flummox';
import AuthAction from './actions/auth';
import PostsAction from './actions/posts';
import AuthStore from './stores/auth';
import PostsStore from './stores/posts';

export default class extends Flux {
  constructor() {
    super();

    this.createActions('auth', AuthAction);
    this.createStore('auth', AuthStore, this);

    this.createActions('posts', PostsAction);
    this.createStore('posts', PostsStore, this);
  }
}
