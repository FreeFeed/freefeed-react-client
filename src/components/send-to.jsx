import React from 'react'
import Select from 'react-select'
import {preventDefault} from '../utils'

const MY_FEED = 'My feed'

export default class SendTo extends React.Component {
  constructor(props) {
    super(props)

    let options = props.feeds.map( function (e) {
      return { label: e, value: e }
    })

    let currentUsername = props.user.username
    options.unshift({ label: MY_FEED, value: currentUsername })
    this._values = [currentUsername]

    this.state = {
      value: this._values,
      options: options,
      showFeedsOption: false
    }
  }

  get values() {
    return this._values
  }

  selectChange = (value) => {
    this._values = value.map(item => item.value)
    this.setState({ value })
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
          <Select
            name="select-feeds"
            placeholder="Select feeds..."
            value={this.state.value}
            options={this.state.options}
            onChange={this.selectChange}
            multi={true}
            clearable={false} />
        )}
      </div>
    )
  }
}
 