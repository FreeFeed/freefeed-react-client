import React from 'react';
import { connect } from 'react-redux';
import SignupForm from './signup-form';

function mapStateToProps(state) {
  return { error: state.signUpForm.error };
}

class Signup extends React.PureComponent {
  render() {
    const { error } = this.props;

    return (
      <div className="box">
        <div className="box-header-timeline">Hello</div>
        <div className="box-body">
          <div className="col-md-12">
            <h2 className="p-signin-header">Sign up</h2>
            {error ? (
              <div className="alert alert-danger p-signin-error" role="alert">
                <span id="error-message">{error}</span>
              </div>
            ) : (
              false
            )}
            <div className="row">
              <div className="col-md-6">
                <SignupForm />
              </div>
            </div>
          </div>
        </div>
        <div className="box-footer" />
      </div>
    );
  }
}

export default connect(mapStateToProps)(Signup);
