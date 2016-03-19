import React from 'react'
import Select from 'react-select'
import {preventDefault} from '../utils'

const MY_FEED_LABEL = 'My feed'

export default class SendTo extends React.Component {
  constructor(props) {
    super(props)

    let options = props.feeds.map((item) => ({
      label: item.user.username,
      value: item.user.username,
      type: item.user.type
    }))

    let myFeedUsername = props.user.username
    options.unshift({ label: MY_FEED_LABEL, value: myFeedUsername, type: 'group' })

    this._values = (props.defaultFeed ? [props.defaultFeed] : [])

    this.state = {
      values: this._values,
      options: options,
      showFeedsOption: !props.defaultFeed,
      isWarningDisplayed: false
    }
  }

  get values() {
    return this._values
  }

  isGroupsOrDirectsOnly = (values) => {
    let types = {}
    for (let v of values) {
      types[v.type] = v
    }
    return Object.keys(types).length <= 1
  }

  selectChanged = (values) => {
    this._values = values.map(item => item.value)
    let isWarningDisplayed = !this.isGroupsOrDirectsOnly(values)
    this.setState({ values, isWarningDisplayed })
    this.props.onChange()
  }

  toggleSendTo = _ => {
    let newShowFeedsOption = !this.state.showFeedsOption
    this.setState({ showFeedsOption: newShowFeedsOption })
  }

  render() {
    const defaultFeedLabel = (this.state.values[0] === this.props.user.username ? MY_FEED_LABEL : this.state.values[0])

    return (
      <div className="send-to">
        {!this.state.showFeedsOption ? (
          <div>
            To:&nbsp;
            <span className="Select-value-label-standalone">{defaultFeedLabel}</span>&nbsp;
            <a className="p-sendto-toggler" onClick={preventDefault(_=>this.toggleSendTo())}>Add/Edit</a>
          </div>
        ) : (
          <div>
            <Select
              name="select-feeds"
              placeholder="Select feeds..."
              value={this.state.values}
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
 