import React from 'react';
import {preventDefault} from '../utils';
import throbber16 from 'assets/images/throbber-16.gif';

import GroupFeedTypePicker from './group-feed-type-picker';

export default class GroupSettingsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      screenName: this.props.group.screenName,
      description: this.props.group.description,
      isPrivate: this.props.group.isPrivate,
      isRestricted:  this.props.group.isRestricted,
      isWarningDisplayed: false
    };
  }

  componentWillReceiveProps = (newProps) => {
    if (newProps.status !== "loading") {
      this.setState({
        screenName: newProps.group.screenName,
        description: newProps.group.description,
        isPrivate: newProps.group.isPrivate,
        isRestricted: newProps.group.isRestricted,
        isWarningDisplayed: false
      });
    }
  }

  handleChange = (property) => (event) => {
    const newState = {};
    newState[property] = event.target.value;
    this.setState(newState);
  }

  handlePrivacyTypeChange = (privacySettings) => {
    const newState = {
      ...privacySettings,
      isWarningDisplayed: (
        this.props.group.isPrivate == 1 &&
        privacySettings.hasOwnProperty('isPrivate') &&
        privacySettings.isPrivate == 0
      )
    };
    this.setState(newState);
  }

  saveSettings = () => {
    this.setState({ isWarningDisplayed: false });
    if (this.props.status !== 'loading') {
      this.props.updateGroup(this.props.group.id, this.state);
    }
  }

  componentWillUnmount() {
    this.props.resetGroupUpdateForm();
  }

  render() {
    return (
      <form onSubmit={preventDefault(this.saveSettings)}>
        <div className="form-group">
          <label htmlFor="screenName">Display name:</label>
          <input id="screenName" className="form-control" name="screenName" type="text" value={this.state.screenName} onChange={this.handleChange('screenName')}/>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" className="form-control" name="description" value={this.state.description} onChange={this.handleChange('description')} maxLength="1500"/>
        </div>
        <GroupFeedTypePicker isPrivate={this.state.isPrivate}
                             isRestricted={this.state.isRestricted}
                             updateGroupPrivacySettings={this.handlePrivacyTypeChange} />
        <p>
          <button className="btn btn-default" type="submit">Update</button>
          {this.props.status === 'loading' ? (
            <span className="settings-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </p>
        {this.state.isWarningDisplayed ? (
          <div className="alert alert-warning" role="alert">
            You are about to change the group type from private to public. It means anyone will be able to read its posts and comments, which are only available to group members now.
          </div>
        ) : false}
        {this.props.status === 'success' ? (
          <div className="alert alert-info" role="alert">Updated!</div>
        ) : this.props.status === 'error' ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>);
  }
}