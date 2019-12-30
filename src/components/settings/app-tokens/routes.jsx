import React, { lazy } from 'react';
import { Route, IndexRoute } from 'react-router';

const tokensPage = lazy(() => import('./tokens'));
const createTokenPage = lazy(() => import('./create-token'));
const createLinkPage = lazy(() => import('./create-link'));
const scopesPage = lazy(() => import('./scopes-list'));

export function tokensRoute(rootPath) {
  return (
    <Route path={rootPath}>
      <IndexRoute component={tokensPage} />
      <Route path="create" component={createTokenPage} />
      <Route path="create-link" component={createLinkPage} />
      <Route path="scopes" component={scopesPage} />
    </Route>
  );
}
