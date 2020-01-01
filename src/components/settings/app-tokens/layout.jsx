import React from 'react';
import { Link } from 'react-router';

import { SettingsPage } from '../layout';

export function withLayout(title, Component) {
  const header =
    title === 'Application tokens' ? (
      title
    ) : (
      <>
        <Link to="/settings/app-tokens">App tokens</Link> <small>/</small> {title}
      </>
    );
  return (props) => (
    <SettingsPage title={title} header={header}>
      <Component {...props} />
    </SettingsPage>
  );
}
