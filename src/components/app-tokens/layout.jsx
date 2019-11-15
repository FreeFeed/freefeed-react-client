import React from 'react';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

export default function Layout({ title = '', component: Component }) {
  return (
    <div className="content">
      <Helmet title={`${title ? `${title} - ` : ''}Application tokens - FreeFeed`} />
      <div className="box">
        <div className="box-header-timeline">Application tokens</div>
        <div className="box-body">
          <ol className="breadcrumb">
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            {title ? (
              <>
                <li>
                  <Link to="/settings/app-tokens">Application tokens</Link>
                </li>
                <li className="active">{title}</li>
              </>
            ) : (
              <li className="active">Application tokens</li>
            )}
          </ol>

          {title && <h3>{title}</h3>}

          <Component />
        </div>
      </div>
    </div>
  );
}
