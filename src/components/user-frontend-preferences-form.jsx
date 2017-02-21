import React from 'react';

import throbber16 from '../../assets/images/throbber-16.gif';
import {preventDefault} from '../utils';
import * as FrontendPrefsOptions from '../utils/frontend-preferences-options';

export default class UserFrontendPreferencesForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.props.preferences;
    this.state.sHideUsers = this.state.homefeed.hideUsers.join(', ');
  }

  changeDisplayOption = (event) => {
    this.setState({
      displayNames: {
        ...this.state.displayNames,
        displayOption: parseInt(event.target.value, 10)
      }
    });
  }

  changeUseYou = (event) => {
    this.setState({
      displayNames: {
        ...this.state.displayNames,
        useYou: event.target.checked
      }
    });
  }

  changeOmitBubbles = (event) => {
    this.setState({
      comments: {
        ...this.state.comments,
        omitRepeatedBubbles: event.target.checked
      }
    });
  }

  changeHighlightComments = (event) => {
    this.setState({
      comments: {
        ...this.state.comments,
        highlightComments: event.target.checked
      }
    });
  }

  changeAllowLinksPreview = (event) => {
    this.setState({
      allowLinksPreview: event.target.checked
    });
  }

  changeReadMoreStyle = (event) => {
    this.setState({
      readMoreStyle: event.target.checked ? 'modern' : 'expandable'
    });
  }

  chandeHideUsers = (event) => {
    this.setState({
      sHideUsers: event.target.value
    });
  }

  savePreferences = () => {
    if (this.props.status !== 'loading') {
      const prefs = {...this.state};
      prefs.homefeed.hideUsers = prefs.sHideUsers.toLowerCase().match(/[\w-]+/g) || [];
      delete prefs.sHideUsers;
      this.props.updateFrontendPreferences(this.props.userId, prefs);
    }
  }

  render() {
    return (
      <form onSubmit={preventDefault(this.savePreferences)}>
        <h3>Display preferences</h3>

        <p>How user names should appear:</p>

        <div className="radio">
          <label>
            <input
              type="radio"
              name="displayOption"
              value={FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME}
              checked={this.state.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME}
              onChange={this.changeDisplayOption}/>
            Display name only
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="displayOption"
              value={FrontendPrefsOptions.DISPLAYNAMES_BOTH}
              checked={this.state.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_BOTH}
              onChange={this.changeDisplayOption}/>
            Display name + username
          </label>
        </div>
        <div className="radio">
          <label>
            <input
              type="radio"
              name="displayOption"
              value={FrontendPrefsOptions.DISPLAYNAMES_USERNAME}
              checked={this.state.displayNames.displayOption === FrontendPrefsOptions.DISPLAYNAMES_USERNAME}
              onChange={this.changeDisplayOption}/>
            Username only
          </label>
        </div>

        <div className="checkbox checkbox-displayNames-useYou">
          <label>
            <input type="checkbox" name="useYou" value="1" checked={this.state.displayNames.useYou} onChange={this.changeUseYou}/>
            Show your own name as "You"
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input type="checkbox" name="bubbles" value="1" checked={this.state.comments.omitRepeatedBubbles} onChange={this.changeOmitBubbles}/>
            Omit bubbles for subsequent comments from the same author
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input type="checkbox" name="bubbles" value="1" checked={this.state.comments.highlightComments} onChange={this.changeHighlightComments}/>
            Highlight comments when hovering on @username or ^ and ↑
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input type="checkbox" name="bubbles" value="1" checked={this.state.allowLinksPreview} onChange={this.changeAllowLinksPreview}/>
              Show advanced previews of links in posts (Embedly). Link should start with http(s)://, post should have no attached images. If you don't want to have link preview, add ! before a link without spaces.
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input type="checkbox" name="bubbles" value="1" checked={this.state.readMoreStyle !== 'expandable'} onChange={this.changeReadMoreStyle}/>
              Use readmore-style with always expanded line breaks
          </label>
        </div>

        <div className="form-group">
          Hide posts from these users/groups in homefeed
          (enter comma separated list of usernames/groupnames):<br/>
          <textarea className="form-control" value={this.state.sHideUsers} onChange={this.chandeHideUsers}/>
        </div>

        <p>
          <button className="btn btn-default" type="submit">Update</button>
          {this.props.status === 'loading' ? (
            <span className="settings-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </p>

        {this.props.status === 'success' ? (
          <div className="alert alert-info" role="alert">Updated!</div>
        ) : this.props.status === 'error' ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}
      </form>
    );
  }
}
