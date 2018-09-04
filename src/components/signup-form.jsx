import React from 'react';
import { connect } from 'react-redux';
import Recaptcha from 'react-google-recaptcha';
import isEmail from 'validator/lib/isEmail';

import config from '../config';
import { signUpChange, signUp, signUpEmpty } from '../redux/action-creators';
import { preventDefault } from '../utils';
import LoaderContainer from './loader-container';

const captchaConfig = config.captcha;

function mapStateToProps(state) {
  return { ...state.signUpForm };
}

function mapDispatchToProps(dispatch) {
  return {
    signUpChange: (...args) => dispatch(signUpChange(...args)),
    signUp: (...args) => dispatch(signUp(...args)),
    signUpEmpty: (...args) => dispatch(signUpEmpty(...args)),
  };
}

const USERNAME_STOP_LIST = [
  'anonymous', 'public', 'about', 'signin', 'logout',
  'signup', 'filter', 'settings', 'account', 'groups',
  'friends', 'list', 'search', 'summary', 'share', '404',
  'iphone', 'attachments', 'files', 'profilepics',
  'invite', 'invited',
];

function isValidUsername(username) {
  const valid = username
        && username.length >= 3
        && username.length <= 25
        && username.match(/^[A-Za-z0-9]+$/)
        && USERNAME_STOP_LIST.indexOf(username) == -1;

  return valid;
}

function isValidEmail(email) {
  return email && isEmail(email);
}

function isValidPassword(password) {
  return password && password.length > 4;
}

function capitalizeFirstLetter(str) {
  return str.replace(/^\w/g, (l) => l.toUpperCase());
}

function validate({ username, password, email, captcha }) {
  const errorMessages = [];

  if (!isValidUsername(username)) {
    errorMessages.push('invalid username');
  }

  if (!isValidPassword(password)) {
    errorMessages.push('invalid password');
  }

  if (!isValidEmail(email)) {
    errorMessages.push('invalid email');
  }

  if (captchaConfig.siteKey !== '' && !captcha) {
    errorMessages.push('captcha is not filled');
  }

  return errorMessages.length == 0 ? null : capitalizeFirstLetter(errorMessages.join(', '));
}

function signUpFunc(form, { signUp, signUpEmpty, invitationId }) {
  const errorMessage = validate(form);

  if (!errorMessage) {
    signUp({ ...form, invitationId });
  } else {
    signUpEmpty(errorMessage);
  }
}

const LABELS = {
  'en': {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    subscribe: 'Subscribe to recommended users and groups',
    signup: 'Sign up',
  },
  'ru': {
    // username: 'Имя пользователя (username, латинские буквы и цифры, от трех символов и больше)',
    username: 'Имя пользователя',
    email: 'Email',
    password: 'Пароль',
    subscribe: 'Подписаться на рекомендованных пользователей и группы',
    signup: 'Зарегистрироваться',
  },
};

class Signup extends React.Component {
  state = {
    username: '',
    password: '',
    email: '',
    captcha: null,
    subscribe: true,
  };

  toggleSubscribe = () => this.setState({ subscribe: !this.state.subscribe });

  handleUsernameChange = (e) => this.setState({ username: e.target.value });

  handleEmailChange = (e) => this.setState({ email: e.target.value });

  handlePasswordChange = (e) => this.setState({ password: e.target.value });

  handleRecaptchaChange = (captcha) => this.setState({ captcha });

  handleRecaptchaExpiration = () => this.setState({ captcha: null });

  render() {
    const { loading, invitationId, lang = 'en' } = this.props;

    return (
      <LoaderContainer loading={loading}>
        <form onSubmit={preventDefault(() => signUpFunc(this.state, this.props))} className="p-signin">
          <div className="form-group">
            <label htmlFor="username">{LABELS[lang].username}</label>
            <input
              id="username"
              className="ember-view ember-text-field form-control"
              type="text"
              onChange={this.handleUsernameChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{LABELS[lang].email}</label>
            <input
              id="email"
              className="ember-view ember-text-field form-control"
              type="text"
              onChange={this.handleEmailChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{LABELS[lang].password}</label>
            <input
              id="password"
              className="ember-view ember-text-field form-control"
              type="password"
              onChange={this.handlePasswordChange}
            />
          </div>

          {captchaConfig.siteKey &&
            <div className="form-group">
              <Recaptcha
                sitekey={captchaConfig.siteKey}
                theme="light" type="image"
                onChange={this.handleRecaptchaChange}
                onExpired={this.handleRecaptchaExpiration}
              />
            </div>
          }

          {invitationId &&
            <div className="form-group checkbox">
              <label>
                <input type="checkbox" name="subscribe-groups" value="0" checked={this.state.subscribe} onChange={this.toggleSubscribe} />
                {LABELS[lang].subscribe}
              </label>
            </div>}

          <div className="form-group">
            <button className="btn btn-default p-signin-action" type="submit">{LABELS[lang].signup}</button>
          </div>
        </form>
      </LoaderContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
