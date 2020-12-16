import { Route, IndexRoute } from 'react-router';
import { lazyRetry } from '../../../utils/retry-promise';

const tokensPage = lazyRetry(() => import('./tokens'));
const createTokenPage = lazyRetry(() => import('./create-token'));
const createLinkPage = lazyRetry(() => import('./create-link'));
const scopesPage = lazyRetry(() => import('./scopes-list'));

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
