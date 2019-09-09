import React from 'react';

const PUBLIC = 'PUBLIC',
  PROTECTED = 'PROTECTED',
  PRIVATE = 'PRIVATE';

function getPrivacyFlags(mode) {
  if (mode === PRIVATE) {
    return { isProtected: '1', isPrivate: '1' };
  } else if (mode === PROTECTED) {
    return { isProtected: '1', isPrivate: '0' };
  }
  return { isProtected: '0', isPrivate: '0' };
}

function getPrivacyMode(flags) {
  if (flags.isPrivate === '1') {
    return PRIVATE;
  } else if (flags.isProtected === '1') {
    return PROTECTED;
  }
  return PUBLIC;
}

export default class GroupFeedTypePicker extends React.Component {
  handleChange = (event) => {
    const {
      target: { name, value },
    } = event;
    if (name === 'privacy') {
      this.props.updateGroupPrivacySettings(getPrivacyFlags(value));
    } else if (name === 'isRestricted') {
      this.props.updateGroupPrivacySettings({ [name]: value });
    }
  };

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
                <input
                  type="radio"
                  name="privacy"
                  value={PUBLIC}
                  checked={getPrivacyMode(this.props) === PUBLIC}
                  onChange={this.handleChange}
                />
              </div>
              <div className="option">Everyone (public group)</div>
            </label>

            <label className="option-box">
              <div className="input">
                <input
                  type="radio"
                  name="privacy"
                  value={PROTECTED}
                  checked={getPrivacyMode(this.props) === PROTECTED}
                  onChange={this.handleChange}
                />
              </div>
              <div className="option">FreeFeed users (protected group)</div>
            </label>

            <label className="option-box">
              <div className="input">
                <input
                  type="radio"
                  name="privacy"
                  value={PRIVATE}
                  checked={getPrivacyMode(this.props) === PRIVATE}
                  onChange={this.handleChange}
                />
              </div>
              <div className="option">Group members (private group)</div>
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
                <input
                  type="radio"
                  name="isRestricted"
                  value="0"
                  checked={this.props.isRestricted === '0'}
                  onChange={this.handleChange}
                />
              </div>
              <div className="option">Every group member</div>
            </label>

            <label className="option-box">
              <div className="input">
                <input
                  type="radio"
                  name="isRestricted"
                  value="1"
                  checked={this.props.isRestricted === '1'}
                  onChange={this.handleChange}
                />
              </div>
              <div className="option">Group administrators only</div>
            </label>
          </div>
        </div>
      </div>
    );
  }
}
