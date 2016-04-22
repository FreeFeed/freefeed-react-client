import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {signInChange, signIn, signInEmpty} from '../redux/action-creators';
import {preventDefault} from '../utils';
import LoaderContainer from './loader-container';

function mapStateToProps(state) {
  return {...state.signInForm};
}

function mapDispatchToProps(dispatch) {
  return {
    signInChange: (...args) => dispatch(signInChange(...args)),
    signIn: (...args) => dispatch(signIn(...args)),
    signInEmpty: (...args) => dispatch(signInEmpty(...args)),
  };
}

function signInFunc(props) {
  if (props.username && props.password) {
    props.signIn(props.username, props.password);
  } else {
    props.signInEmpty();
  }
}

function Signin(props) {
  return (
  <div className='box'>
    <div className='box-header-timeline'>
      Hello
    </div>
    <div className='box-body'>
      <div className='col-md-12'>
        <h2 className='p-signin-header'>Sign in</h2>
        {props.error ? (<div className='alert alert-danger p-signin-error' role='alert'>
                          <span id='error-message'>{props.error}</span>
                        </div>) : false}
        <div className='row'>
          <div className='col-md-6'>
            <LoaderContainer loading={props.loading}>
              <form onSubmit={preventDefault(() => signInFunc(props))} className='p-signin'>
                <div className='form-group'>
                  <label htmlFor='username'>Username</label>
                  <input id='username' className='ember-view ember-text-field form-control' type='text' onChange={e => props.signInChange(e.target.value)}/>
                </div>
                <div className='form-group'>
                  <label htmlFor='password'>Password</label>
                  <input id='password' className='ember-view ember-text-field form-control' type='password' onChange={e => props.signInChange(undefined, e.target.value)}/>
                </div>
                <div className='form-group'>
                  <button className='btn btn-default p-singin-action' type='submit'>Sign in</button>
                </div>
              </form>
            </LoaderContainer>
            <p>New to freefeed? <Link to='/signup'>Create an account »</Link></p>
          </div>
        </div>
      </div>
    </div>
    <div className='box-footer'>
    </div>
  </div>
);}

export default connect(mapStateToProps, mapDispatchToProps)(Signin);
