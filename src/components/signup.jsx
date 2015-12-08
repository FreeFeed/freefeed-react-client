import React from 'react'
import {connect} from 'react-redux'
import {signUpChange, signUp, signUpEmpty} from '../redux/action-creators'
import {preventDefault} from '../utils'
import LoaderContainer from './loader-container'
import {captcha as captchaConfig} from '../config'
import Recaptcha from 'react-google-recaptcha'

function mapStateToProps (state){
  return {...state.signUpForm}
}

function mapDispatchToProps(dispatch){
  return {
    signUpChange: (...args) => dispatch(signUpChange(...args)),
    signUp: (...args) => dispatch(signUp(...args)),
    signUpEmpty: (...args) => dispatch(signUpEmpty(...args)),
  }
}

function signUpFunc(props){
  if (props.username && props.password && props.email && props.captcha) {
    props.signUp({...props})
  } else {
    props.signUpEmpty()
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
