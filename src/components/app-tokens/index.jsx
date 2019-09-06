import React from 'react';

import Tokens from './tokens';
import CreateToken from './create-token';
import CreateLink from './create-link';
import ScopesList from './scopes-list';
import Layout from './layout';


export default function ({ routeParams: { splat } }) {
  if (!splat) {
    return <Layout component={Tokens} />;
  }
  if (splat === 'create') {
    return <Layout component={CreateToken} title="Generate new token" />;
  }
  if (splat === 'create-link') {
    return <Layout component={CreateLink} title="Create magic link" />;
  }
  if (splat === 'scopes') {
    return <Layout component={ScopesList} title="Token access rights" />;
  }

  return <p>Page not found: {splat}</p>;
}

