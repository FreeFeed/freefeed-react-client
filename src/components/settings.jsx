import React from 'react'
import {connect} from 'react-redux'

const Settings = (props) => (
  <div className='content'>
    <div className='box'>
      <div className='box-header-timeline'>
        Settings
      </div>
      <div className='box-body'>
        <div className='form-group p-settings-screenname'>
          <label htmlFor='screenName'>Screen name:</label>
          <input id='screenName' className='form-control' name='screenName' type='text' defaultValue={props.user.username}/>
        </div>
        <div className='form-group p-settings-email'>
          <label htmlFor='email'>Email:</label>
          <input id='email' className='form-control' name='email' type='text' defaultValue={props.user.email}/>
        </div>
        <div className='checkbox p-settings-private'>
          <label>
            <input type='checkbox' name='isPrivate'/>
            Private feed
            <small>(only let people I approve see my feed)</small>
          </label>
        </div>
        <p>
          <button className='btn btn-default p-settings-update'>Update</button>
        </p>
        <hr/>
        <h2 className='p-settings-changepassword-header'>Change password</h2>
        <div className='form-group p-settings-currentpassword'>
          <label htmlFor='currentPassword'>Current password:</label>
          <input id='currentPassword' className='form-control' name='currentPassword' type='password'/>
        </div>
        <div className='form-group p-settings-newpassword'>
          <label htmlFor='password'>New password:</label>
          <input id='password' className='form-control' name='password' type='password'/>
        </div>

        <div className='form-group p-settings-confirmpassword'>
          <label htmlFor='passwordConfirmation'>Confirm password:</label>
          <input id='passwordConfirmation' className='form-control' name='passwordConfirmation' type='password'/>
        </div>

        <p>
          <button className='btn btn-default p-settings-updatepassword'>Update Password</button>
        </p>
        <h2 className='p-settings-updateprofilepicture-header'>Update Profile Picture</h2>
        <div className='form-group'>
          <input className='' type='file'/>
        </div>
        <p>
          <button className='btn btn-default p-settings-updateprofilepicture'>Update</button>
        </p>
        </div>
      </div>
  </div>
)

function mapStateToProps(state){
  return {
    user: state.user
  }
}

export default connect(state=>state)(Settings)