import React from 'react'
import {preventDefault} from '../utils'

export default class UserPhotoForm extends React.Component {
  render(){
    return (
      <form onSubmit={preventDefault(this.updatePhoto)}>
        <h3>Update profile picture</h3>
        <div className='form-group'>
          <input type='file' ref='photo'/>
        </div>
        <p>
          <button className='btn btn-default p-settings-updateprofilepicture'>Update</button>
        </p>
        {this.props.success ?
          (<div className='alert alert-info p-settings-alert' role='alert'>
              <span id='error-message'>Your photo has been updated</span>
            </div>) : false}
        {this.props.error ?
          (<div className='alert alert-danger p-settings-alert' role='alert'>
              <span id='error-message'>{this.props.errorText}</span>
            </div>) : false}
      </form>)
  }
  updatePhoto = () => {
    if (!this.props.isSaving){
      this.props.updateUserPhoto(this.refs.photo.files[0])
    }
  }
}