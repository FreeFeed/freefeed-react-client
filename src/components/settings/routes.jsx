import { IndexRoute, Route } from 'react-router';

import { lazyRetry } from '../../utils/retry-promise';
import { tokensRoute } from './app-tokens/routes';

const Layout = lazyRetry(() => import('./layout'));
const ProfilePage = lazyRetry(() => import('./profile'));
const SignInPage = lazyRetry(() => import('./sign-in'));
const AppearancePage = lazyRetry(() => import('./appearance'));
const PrivacyPage = lazyRetry(() => import('./privacy'));
const NotificationsPage = lazyRetry(() => import('./notififications'));
const DeactivatePage = lazyRetry(() => import('./deactivate'));
const AuthSessionsPage = lazyRetry(() => import('./auth-sessions'));

export function settingsRoute(rootPath) {
  return (
    <Route path={rootPath} component={Layout}>
      <IndexRoute component={ProfilePage} />
      <Route path="sign-in" component={SignInPage} />
      <Route path="sign-in/sessions" component={AuthSessionsPage} />
      <Route path="privacy" component={PrivacyPage} />
      <Route path="appearance" component={AppearancePage} />
      <Route path="notifications" component={NotificationsPage} />
      <Route path="deactivate" component={DeactivatePage} />
      {tokensRoute('app-tokens')}
    </Route>
  );
}
