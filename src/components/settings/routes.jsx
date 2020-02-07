import React, { lazy } from 'react';
import { IndexRoute, Route } from 'react-router';

import { tokensRoute } from './app-tokens/routes';

const Layout = lazy(() => import('./layout'));
const ProfilePage = lazy(() => import('./profile'));
const SignInPage = lazy(() => import('./sign-in'));
const AppearancePage = lazy(() => import('./appearance'));
const PrivacyPage = lazy(() => import('./privacy'));
const NotificationsPage = lazy(() => import('./notififications'));

export function settingsRoute(rootPath) {
  return (
    <Route path={rootPath} component={Layout}>
      <IndexRoute component={ProfilePage} />
      <Route path="sign-in" component={SignInPage} />
      <Route path="privacy" component={PrivacyPage} />
      <Route path="appearance" component={AppearancePage} />
      <Route path="notifications" component={NotificationsPage} />
      {tokensRoute('app-tokens')}
    </Route>
  );
}
