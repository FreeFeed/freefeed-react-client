/* global CONFIG */
import { Helmet } from 'react-helmet';

export function NotFound() {
  return (
    <div className="box">
      <Helmet title={`Page not found - ${CONFIG.siteTitle}`} defer={false} />
      <div className="box-header-timeline">Page not found</div>
      <div className="box-body">
        <p className="alert alert-danger">
          There is no page with such an address on {CONFIG.siteTitle}.
        </p>
      </div>
      <div className="box-footer" />
    </div>
  );
}
