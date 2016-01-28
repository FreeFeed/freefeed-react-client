import React from 'react'
import {preventDefault} from '../utils'
import throbber16 from 'assets/images/throbber-16.gif'

export default class GroupSettingsForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      screenName: this.props.group.screenName,
      description: this.props.group.description
    }
  }

  componentWillReceiveProps = (newProps) => {
    this.setState({
      screenName: newProps.group.screenName,
      description: newProps.group.description
    })
  }

  handleChange = (property) => (event) => {
    const newState = {}
    newState[property] = event.target.value
    this.setState(newState);
  }

  saveSettings = () => {
    if (this.props.status !== 'loading') {
      this.props.updateGroup(this.props.group.id, this.state.screenName, this.state.description)
    }
  }

  render() {
    return (
      <form onSubmit={preventDefault(this.saveSettings)}>
        <div className="form-group">
          <label htmlFor="screenName">Screen name:</label>
          <input id="screenName" className="form-control" name="screenName" type="text" value={this.state.screenName} onChange={this.handleChange('screenName')}/>
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" className="form-control" name="description" value={this.state.description} onChange={this.handleChange('description')} maxLength="1500"/>
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
      </form>)
  }
}