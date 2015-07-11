import FluxComponent from 'flummox/component';
import React from 'react';
import r from 'react-router';

import Flux from './Flux.jsx';
import routes from './routing.jsx';

var flux = new Flux();

var router = r.create({
  routes: routes,
  location: r.HistoryLocation
});

router.run(async (Handler, state) => {
  flux.getActions('auth').getWhoami()

  React.render(
    <FluxComponent flux={flux}>
      <Handler {...state} />
    </FluxComponent>,
    document.getElementById('app')
  );
});
