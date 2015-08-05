import {Flux} from 'flummox';
import AuthAction from './actions/auth';
import PostsAction from './actions/posts';
import MainStore from './stores/main';

export default class extends Flux {
  constructor() {
    super();

    this.createActions('auth', AuthAction);
    this.createActions('posts', PostsAction);
    this.createStore('main', MainStore, this);
  }
}
