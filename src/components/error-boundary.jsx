import React from 'react';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // You can also log the error to an error reporting service
    // See https://reactjs.org/docs/error-boundaries.html
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error ? `${this.state.error.name}: ${this.state.error.message}` : 'Unexpected error';
      return (
        <div className="error-boundary">
          <div className="error-boundary-header">Oops! Something went wrong :(</div>
          <div className="error-boundary-details">{errorMessage}</div>
        </div>);
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
