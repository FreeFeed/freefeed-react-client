/* global CONFIG */
import { PureComponent } from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: {}, errorInfo: {} };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      level: 'error',
      tags: { area: 'react/errorBoundary' },
      extra: { errorInfo },
    });
  }

  render() {
    const { error, hasError } = this.state;

    if (hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary-header">
            Oops! {this.props.message || 'Something went wrong :('}
          </div>
          <div className="error-boundary-details">
            Please contact <a href="/support">@support</a> with a screenshot of this message.
          </div>
          <div className="error-boundary-details">
            <p>
              {error.name}: <strong>{error.message}</strong>
              <br />
              {error.stack?.split('\n').slice(1, 5).join(' ')}
            </p>
            <p>{window.navigator.userAgent}</p>
            <p>
              URL: {document.location.href}
              {CONFIG.betaChannel.enabled &&
                CONFIG.betaChannel.isBeta &&
                ` (⚠ ${CONFIG.betaChannel.subHeading} instance)`}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
