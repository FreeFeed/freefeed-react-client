import { Route, Switch } from 'wouter';
import { lazyRetry } from '../../../utils/retry-promise';

const tokensPage = lazyRetry(() => import('./tokens'));
const createTokenPage = lazyRetry(() => import('./create-token'));
const createLinkPage = lazyRetry(() => import('./create-link'));
const scopesPage = lazyRetry(() => import('./scopes-list'));

export function tokensRoute(rootPath) {
  return (
    <Route path={rootPath} nest>
      <Switch>
        <Route path="/" component={tokensPage} />
        <Route path="create" component={createTokenPage} />
        <Route path="create-link" component={createLinkPage} />
        <Route path="scopes" component={scopesPage} />
      </Switch>
    </Route>
  );
}
