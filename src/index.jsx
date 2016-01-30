import 'styles/common/common.scss'
import 'styles/helvetica/app.scss'
import 'index.jade'

require.context('assets/fonts', true, /fontawesome.*/i)

import React from 'react'
import ReactDOM from 'react-dom'
import {Route, IndexRoute} from 'react-router'
import {Provider} from 'react-redux'
import {ReduxRouter} from 'redux-router'

import configureStore from './redux/configure-store'
import {whoAmI, home, discussions, getUserFeed, unauthenticated, getSinglePost} from './redux/action-creators'

import Layout from './components/layout'
import Home from './components/home'
import Discussions from './components/discussions'
import About from './components/about'
import NotFound from './components/not-found'
import Signin from './components/signin'
import Signup from './components/signup'
import Settings from './components/settings'
import SinglePost from './components/single-post'
import UserFeed from './components/user-feed'
import Subscribers from './components/subscribers'
import Subscriptions from './components/subscriptions'
import GroupSettings from './components/group-settings'
import Groups from './components/groups'

const store = configureStore()

//request main info for user
if (store.getState().authenticated){
  store.dispatch(whoAmI())
} else {
  // just commented for develop sign up form
  store.dispatch(unauthenticated())
}

import {bindRouteActions} from './redux/route-actions'

const boundRouteActions = bindRouteActions(store.dispatch)

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter>
      <Route path='/' component={Layout}>
        <IndexRoute name='home' component={Home} onEnter={boundRouteActions('home')}/>
        <Route path='about' component={About} />
        <Route path='signin' component={Signin}/>
        <Route path='signup' component={Signup}/>
        <Route path='settings' component={Settings}/>
        <Route name='groupSettings' path='/:userName/settings' component={GroupSettings} onEnter={boundRouteActions('getUserInfo')}/>
        <Route name='discussions' path='filter/discussions' component={Discussions} onEnter={boundRouteActions('discussions')}/>
        <Route name='direct' path='filter/direct' component={Discussions} onEnter={boundRouteActions('direct')}/>
        <Route name='groups' path='/groups' component={Groups}/>
        <Route name='userFeed' path='/:userName' component={UserFeed} onEnter={boundRouteActions('userFeed')}/>
        <Route name='subscribers' path='/:userName/subscribers' component={Subscribers} onEnter={boundRouteActions('subscribers')}/>
        <Route name='subscriptions' path='/:userName/subscriptions' component={Subscriptions} onEnter={boundRouteActions('subscriptions')}/>
        <Route name='userComments' path='/:userName/comments' component={UserFeed} onEnter={boundRouteActions('userComments')}/>
        <Route name='userLikes' path='/:userName/likes' component={UserFeed} onEnter={boundRouteActions('userLikes')}/>
        <Route name='post' path='/:userName/:postId' component={SinglePost} onEnter={boundRouteActions('post')}/>
      </Route>
    </ReduxRouter>
  </Provider>,
  document.getElementById('app')
)
