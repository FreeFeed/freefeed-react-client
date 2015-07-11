import React from 'react';
import {DefaultRoute, NotFoundRoute, Redirect, Route} from 'react-router';

import Layout from './layout.jsx';
import Home from './home.jsx';
import About from './about.jsx';
import NotFound from './notfound.jsx';

var routes = (
  <Route handler={Layout} path="/">
    <DefaultRoute name="timeline.home" handler={Home} />

    <Route path="/signup" name="session.new" handler={About} />
    <Route path="/session/logout" name="session.destroy" handler={About} />
    <Route path="/settings" name="settings.index" handler={About} />

    <Route path="/:username" name="timeline.index" handler={About} />
    <Route path="/filter/direct" name="timeline.directs" handler={About} />
    <Route path="/filter/discussions" name="timeline.discussions" handler={About} />
    <Route path="/:username/subscruptions" name="timeline.subscriptions" handler={About} />
    <Route path="/groups" name="groups.home" handler={About} />

    <NotFoundRoute handler={NotFound}/>
  </Route>
);

export default routes;
