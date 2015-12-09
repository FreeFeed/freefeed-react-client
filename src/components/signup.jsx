import React from 'react'
import {connect} from 'react-redux'
import {signUpChange, signUp, signUpEmpty} from '../redux/action-creators'
import {preventDefault} from '../utils'
import LoaderContainer from './loader-container'
import {captcha as captchaConfig} from '../config'
import Recaptcha from 'react-google-recaptcha'
import validator from 'validator'

function mapStateToProps (state) {
  return {...state.signUpForm}
}

function mapDispatchToProps(dispatch) {
  return {
    signUpChange: (...args) => dispatch(signUpChange(...args)),
    signUp: (...args) => dispatch(signUp(...args)),
    signUpEmpty: (...args) => dispatch(signUpEmpty(...args)),
  }
}

const USERNAME_STOP_LIST = [
  'anonymous', 'public', 'about', 'signin', 'logout',
  'signup', 'filter', 'settings', 'account', 'groups',
  'friends', 'list', 'search', 'summary', 'share', '404',
  'iphone', 'attachments', 'files', 'profilepics'
]

function isValidUsername(username) {
  let valid = username
        && username.length >= 3
        && username.length <= 25
        && username.match(/^[A-Za-z0-9]+$/)
        && USERNAME_STOP_LIST.indexOf(username) == -1

  return valid
}

function isValidEmail(email) {
  return email && validator.isEmail(email)
}

function isValidPassword(password) {
  return password && password.length > 4
}

function capitalizeFirstLetter(str) {
  return str.replace(/^\w/g, l => l.toUpperCase())
}

function validate(props) {
  let errorMessages = []

  if (!isValidUsername(props.username)) {
    errorMessages.push('invalid username')
  }

  if (!isValidPassword(props.password)) {
    errorMessages.push('invalid password')
  }

  if (!isValidEmail(props.email)) {
    errorMessages.push('invalid email')
  }

  if(!props.captcha) {
    errorMessages.push('сaptcha has not filled')
  }

  return errorMessages.length == 0 ? null : capitalizeFirstLetter(errorMessages.join(', '))
}

function signUpFunc(props) {
  let errorMessage = validate(props)

  if(!errorMessage) {
    props.signUp({...props})
  } else {
    props.signUpEmpty(errorMessage)
  }
}

function Signup (props) {
  return (
  <div className='box'>
    <div className='box-header-timeline'>
      Hello
    </div>
    <div className='box-body'>
      <div className='col-md-12'>
        <h2 className='p-signin-header'>Sign up</h2>
        {props.error ? (<div className='alert alert-danger p-signin-error' role='alert'>
                          <span id='error-message'>{props.error}</span>
                        </div>) : false}
        <div className='row'>
          <div className='col-md-6'>
            <LoaderContainer loading={props.loading}>
              <form onSubmit={preventDefault(() => signUpFunc(props))} className='p-signin'>
                <div className='form-group'>
                  <label htmlFor='username'>Username</label>
                  <input id='username'
                         className='ember-view ember-text-field form-control'
                         type='text'
                         onChange={e => props.signUpChange({username: e.target.value})}/>
                </div>

                <div className='form-group'>
                  <label htmlFor='email'>Email</label>
                  <input id='email'
                         className='ember-view ember-text-field form-control'
                         type='text'
                         onChange={e => props.signUpChange({email: e.target.value})}/>
                </div>

                <div className='form-group'>
                  <label htmlFor='password'>Password</label>
                  <input id='password'
                         className='ember-view ember-text-field form-control'
                         type='password'
                         onChange={e => props.signUpChange({password: e.target.value})}/>
                </div>

                <div className='form-group'>
                  <Recaptcha sitekey={captchaConfig.siteKey}
                             onChange={v => props.signUpChange({captcha: v})} />
                </div>

                <div className='form-group'>
                  <button className='btn btn-default p-singin-action' type='submit'>Sign up</button>
                </div>
              </form>
            </LoaderContainer>
          </div>
        </div>
      </div>
    </div>
    <div className='box-footer'>
    </div>
  </div>
)}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)
