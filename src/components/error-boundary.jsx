/*global Raven*/
import React from 'react';

class ErrorBoundary extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: {}, errorInfo: {} };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof Raven !== 'undefined') {
      Raven.captureException(error, {
        level: 'error',
        tags: { area: 'react/errorBoundary' },
        extra: { errorInfo },
      });
    }
    this.setState({ errorInfo });
  }

  render() {
    const { error, errorInfo, hasError } = this.state;

    if (hasError) {
      const errorLocation = errorInfo.componentStack
        ? `${errorInfo.componentStack.split('\n').slice(0, 2).join(' ')}`
        : '';
      const errorMessage = `${error.name}: ${error.message} ${errorLocation}`;

      return (
        <div className="error-boundary">
          <div className="error-boundary-header">
            Oops! {this.props.message || 'Something went wrong :('}
          </div>
          <div className="error-boundary-details">
            Please contact <a href="/support">@support</a> with a screenshot of this message.
          </div>
          <div className="error-boundary-details">
            <p>{errorMessage}</p>
            <p>
              {window.navigator.userAgent}
              {typeof Raven !== 'undefined' ? '' : ', no Raven'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
