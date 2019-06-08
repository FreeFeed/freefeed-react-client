import React from 'react';

import { preventDefault } from '../utils';
import { Throbber } from './throbber';


export default class GroupPictureForm extends React.Component {
  pictureFile;

  savePicture = () => {
    const [newFile] = this.pictureFile.files;
    if (newFile && this.props.status !== 'loading') {
      this.props.updateGroupPicture(this.props.group.username, newFile);
    }
  };

  componentWillUnmount() {
    this.props.resetGroupUpdateForm();
  }

  registerPictureFile = (el) => {
    this.pictureFile = el;
  };

  render() {
    return (
      <form onSubmit={preventDefault(this.savePicture)}>
        <h3>Profile picture</h3>

        <div className="form-group avatar">
          <img src={this.props.group.profilePictureLargeUrl} width="75" height="75" />
        </div>

        <div className="form-group">
          <input type="file" ref={this.registerPictureFile} />
        </div>

        <div className="form-group">
          <button className="btn btn-default" type="submit">Update</button>

          {this.props.status === 'loading' ? (
            <span className="settings-throbber">
              <Throbber />
            </span>
          ) : false}
        </div>

        {this.props.status === 'success' ? (
          <div className="alert alert-info" role="alert">Profile picture has been updated</div>
        ) : this.props.status === 'error' ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>
    );
  }
}
