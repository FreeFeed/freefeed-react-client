import React from 'react';

import { Throbber, BIG } from './throbber';

export default ({ loading, error, children, fullPage }) => (
  <div className={`loader-container ${fullPage ? '-full' : ''}`}>
    {loading && (
      <div className="loader-overlay">
        <Throbber size={BIG} />
      </div>
    )}
    {error && (
      <div className="loader-overlay loader-overlay--error">
        <div className="loader-error">{error}</div>
      </div>
    )}
    {children}
  </div>
);
