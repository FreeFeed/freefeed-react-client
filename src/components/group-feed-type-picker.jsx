import React from 'react';

export default class GroupFeedTypePicker extends React.Component {

  handleChange = (property) => (event) => {
    this.props.updateGroupPrivacySettings({ [property]: event.target.value });
  }

  render() {
    return (
      <div>
        <div className="row form-group">
          <div className="col-sm-3">
            <label>Who can view posts:</label>
          </div>
          
          <div className="col-sm-9">
            <label className="option-box">
              <div className="input">
                <input type="radio"
                       name="isPrivate"
                       value="0"
                       checked={this.props.isPrivate === '0'} 
                       onChange={this.handleChange('isPrivate')}/>
              </div>
              <div className="option">
                Everyone (public group)
              </div>
            </label>

            <label className="option-box">
              <div className="input">
                <input type="radio"
                       name="isPrivate"
                       value="1"
                       checked={this.props.isPrivate === '1'}  
                       onChange={this.handleChange('isPrivate')}/>
              </div>
              <div className="option">
                Group members (private group)
              </div>
            </label>
          </div>
        </div>

        <div className="row form-group">
          <div className="col-sm-3">
            <label>Who can write posts:</label>
          </div>
          
          <div className="col-sm-9">
            <label className="option-box">
              <div className="input">
                <input type="radio"
                       name="isRestricted"
                       value="0"
                       checked={this.props.isRestricted === '0'}  
                       onChange={this.handleChange('isRestricted')}/>
              </div>
              <div className="option">
                Every group member
              </div>
            </label>

            <label className="option-box">
              <div className="input">
                <input type="radio"
                       name="isRestricted"
                       value="1"
                       checked={this.props.isRestricted === '1'} 
                       onChange={this.handleChange('isRestricted')}/>
              </div>
              <div className="option">
                Group administrators only
              </div>
            </label>
          </div>
        </div>
      </div>
    );
  }
}
