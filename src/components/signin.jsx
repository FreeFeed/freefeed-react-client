import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { signInChange, signIn, signInEmpty } from '../redux/action-creators';
import { preventDefault } from '../utils';
import LoaderContainer from './loader-container';

function mapStateToProps(state) {
  return { ...state.signInForm };
}

function mapDispatchToProps(dispatch) {
  return {
    signInChange: (...args) => dispatch(signInChange(...args)),
    signIn: (...args) => dispatch(signIn(...args)),
    signInEmpty: (...args) => dispatch(signInEmpty(...args)),
  };
}

class Signin extends React.PureComponent {
  handleFormSubmit = preventDefault(() => {
    const { password, signIn, signInEmpty, username } = this.props;

    if (username && password) {
      signIn(username, password);
    } else {
      signInEmpty();
    }
  });

  handleUsernameChange = (e) => {
    this.props.signInChange(e.target.value);
  };

  handlePasswordChange = (e) => {
    this.props.signInChange(undefined, e.target.value);
  };

  render() {
    const { props } = this;

    return (
      <div className="box">
        <div className="box-header-timeline">
          Hello
        </div>
        <div className="box-body">
          <div className="col-md-12">
            <h2 className="p-signin-header">Sign in</h2>
            {props.error && (
              <div className="alert alert-danger p-signin-error" role="alert">
                <span id="error-message">{props.error}</span>
              </div>
            )}
            {props.requireAuth && (
              <div className="alert alert-danger p-signin-error" role="alert">
                <span id="error-message">Please sign in or <Link to="/signup">sign up</Link> before visiting this page.</span>
              </div>
            )}
            <div className="row">
              <div className="col-md-6">
                <LoaderContainer loading={props.loading}>
                  <form onSubmit={this.handleFormSubmit} className="p-signin">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input id="username" className="ember-view ember-text-field form-control" type="text" onChange={this.handleUsernameChange} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input id="password" className="ember-view ember-text-field form-control" type="password" onChange={this.handlePasswordChange} />
                    </div>
                    <div className="form-group">
                      <button className="btn btn-default p-singin-action" type="submit">Sign in</button>
                    </div>
                  </form>
                </LoaderContainer>
                <p>New to freefeed? <Link to="/signup">Create an account »</Link></p>
                <p>Forgot your password? <Link to="/restore">Request password reset instructions »</Link></p>
              </div>
            </div>
          </div>
        </div>
        <div className="box-footer" />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signin);
