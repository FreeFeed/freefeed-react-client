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
import {whoAmI, home, discussions, getUserFeed, unauthenticated} from './redux/action-creators'

import Layout from './components/layout'
import Home from './components/home'
import About from './components/about'
import NotFound from './components/not-found'
import Login from './components/login'
import Settings from './components/settings'

const store = configureStore()

//request main info for user
if (store.getState().authenticated){
  store.dispatch(whoAmI())
} else {
  store.dispatch(unauthenticated())
}

ReactDOM.render(
  <Provider store={store}>
    <ReduxRouter>
      <Route path='/' component={Layout}>
        <IndexRoute component={Home} onEnter={()=>store.dispatch(home())}/>
        <Route path='home' component={Home} onEnter={()=>store.dispatch(home())}/>
        <Route path='about' component={About} />
        <Route path='login' component={Login}/>
        <Route path='settings' component={Settings}/>
        <Route path='filter/discussions' component={Home} onEnter={()=>store.dispatch(discussions())}/>
        <Route name='userFeed' path='/:userName' component={Home} onEnter={nextRouter=>store.dispatch(getUserFeed(nextRouter.params.userName))}/>
      </Route>
    </ReduxRouter>
  </Provider>,
  document.getElementById('app')
)
