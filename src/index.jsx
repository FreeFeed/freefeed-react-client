import React from 'react';
import r, {DefaultRoute, NotFoundRoute, Redirect, Route} from 'react-router';

import Home from './home.jsx';
import About from './about.jsx';
import NotFound from './notfound.jsx';
import App from './app.jsx';

import Flux from './Flux.jsx';
import FluxComponent from 'flummox/component';

var routes = (
  <Route handler={App} path="/">
    <DefaultRoute name="timeline.home" handler={Home} />
    <Route name="/signup" name="session.new" handler={About} />

    <NotFoundRoute handler={NotFound}/>

    <Redirect from="company" to="about" />
  </Route>
);

async function performRouteHandlerStaticMethod(routes, methodName, ...args) {
  return Promise.all(routes
      .map(route => route.handler[methodName])
      .filter(method => typeof method === 'function')
      .map(method => method(...args))
  );
}

var flux = new Flux();

var router = r.create({
  routes: routes,
  location: r.HistoryLocation
});

router.run(async (Handler, state) => {
  const routeHandlerInfo = { state, flux };

  await performRouteHandlerStaticMethod(state.routes, 'routerWillRun', routeHandlerInfo);

  React.render(
    <FluxComponent flux={flux}>
      <Handler {...state} />
    </FluxComponent>,
    document.getElementById('app')
  );
});
