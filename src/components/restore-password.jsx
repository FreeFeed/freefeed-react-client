import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import {restorePassword} from '../redux/action-creators';
import {preventDefault} from '../utils';
import LoaderContainer from './loader-container';

function mapStateToProps(state) {
  return {...state.restorePassForm};
}

function mapDispatchToProps(dispatch) {
  return {
    restore: (...args) => dispatch(restorePassword(...args)),
  };
}

function restoreFunc({mail, restore}) {
  if (mail) {
    restore(mail);
  }
}

class RestorePassword extends React.Component {
  render() {
    return (
      <div className='box'>
        <div className='box-header-timeline'>
          Hello
        </div>
        <div className='box-body'>
          <div className='col-md-12'>
            <h2 className='p-signin-header'>{this.props.header}</h2>
            {this.props.error ? (<div className='alert alert-danger p-signin-error' role='alert'>
                              <span id='error-message'>{this.props.error}</span>
                            </div>) : false}
            <div className='row'>
              <div className='col-md-6'>
                <LoaderContainer loading={this.props.loading}>
                  <form onSubmit={preventDefault(() => restoreFunc({restore: this.props.restore, mail: this.refs.mail.value}))} className='p-signin'>
                    <div className='form-group'>
                      <label htmlFor='mail'>E-mail</label>
                      <input id='mail' className='form-control' type='mail' ref='mail'/>
                    </div>
                    <div className='form-group'>
                      <button className='btn btn-default p-singin-action' type='submit'>Reset</button>
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
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RestorePassword);
