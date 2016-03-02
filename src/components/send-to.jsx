import React from 'react'
import Select from 'react-select'
import {preventDefault} from '../utils'

const MY_FEED = 'My feed'

export default class SendTo extends React.Component {
  constructor(props) {
    super(props)

    let options = props.feeds.map( function (item) {
      let name = item.user.username
      return { label: name, value: name, type: item.user.type }
    })

    let currentUsername = props.user.username
    options.unshift({ label: MY_FEED, value: currentUsername, type: 'group' })

    this._values = [currentUsername]

    this.state = {
      value: this._values,
      options: options,
      showFeedsOption: false,
      isWarningDisplayed: false
    }
  }
  
  get values() {
    return this._values
  }

  isGroupsOrDirectsOnly = (value) => {
    let types = {}
    for (let v of value) {
      types[v.type] = v
    }
    return Object.keys(types).length <= 1
  }

  selectChanged = (value) => {
    this._values = value.map(item => item.value)
    let isWarningDisplayed = !this.isGroupsOrDirectsOnly(value)
    this.setState({ value, isWarningDisplayed })
    this.props.onChange()
  }

  toggleSendTo = _ => {
    let newShowFeedsOption = !this.state.showFeedsOption
    this.setState({ showFeedsOption: newShowFeedsOption })
  }

  render() {
    return (
      <div className="send-to">
        {!this.state.showFeedsOption ? (
          <div>
            To:&nbsp;
            <span className="Select-value-label-standalone">My feed</span>&nbsp;
            <a className="p-sendto-toggler" onClick={preventDefault(_=>this.toggleSendTo())}>Add/Edit</a>
          </div>
        ) : (
          <div>
            <Select
              name="select-feeds"
              placeholder="Select feeds..."
              value={this.state.value}
              options={this.state.options}
              onChange={this.selectChanged}
              multi={true}
              clearable={false} />
            {this.state.isWarningDisplayed ? (
              <div className="selector-warning">
                You are going to send a direct message and also post this message to a feed. This means that everyone who sees this feed will be able to see your message. 
              </div>
            ) : false}
          </div>
        )}
      </div>
    )
  }
}
 