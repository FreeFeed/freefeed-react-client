import React from 'react'
import {preventDefault} from '../utils'

export default class UserSettingsForm extends React.Component {
  render(){
    console.log('user to render settings', this.props.user)
    return (
      <form onSubmit={preventDefault(this.updateUser)}>
        <div className='form-group p-settings-screenname'>
          <label htmlFor='screenName'>Screen name:</label>
          <input id='screenName' className='form-control' name='screenName' type='text' defaultValue={this.props.user.screenName} onChange={this.updateSetting('screenName')}/>
        </div>
        <div className='form-group p-settings-email'>
          <label htmlFor='email'>Email:</label>
          <input id='email' className='form-control' name='email' type='text' defaultValue={this.props.user.email} onChange={this.updateSetting('email')}/>
        </div>
        <div className='checkbox p-settings-private'>
          <label>
            <input className='ember-checkbox' type='checkbox' name='isPrivate' defaultChecked={this.props.user.isPrivate == '1' ? true : false} onChange={this.updateChecked}/>
            Private feed
            <small>(only let people I approve see my feed)</small>
          </label>
        </div>
        <p>
          <button className='btn btn-default p-settings-update' type='submit'>Update</button>
        </p>
        {this.props.success ?
          (<div className='alert alert-info p-settings-alert' role='alert'>
              <span id='error-message'>Updated!</span>
            </div>) : false}
        {this.props.error ?
          (<div className='alert alert-danger p-settings-alert' role='alert'>
              <span id='error-message'>Something went wrong during user settings update</span>
            </div>) : false}
      </form>)
  }
  updateUser = () => {
    if (!this.props.isSaving){
      this.props.updateUser(this.props.user.id, this.props.screenName, this.props.email, this.props.isPrivate)
    }
  }
  updateSetting = (setting) => (e) => {
    this.props.userSettingsChange({[setting]: e.target.value})
  }
  updateChecked = (e) =>{
    this.props.userSettingsChange({isPrivate: e.target.checked ? '1' : '0'})
  }
}