import React from 'react';
import Select from 'react-select';
import {preventDefault} from '../utils';

const MY_FEED_LABEL = 'My feed';

export default class SendTo extends React.Component {
  constructor(props) {
    super(props);

    let options = props.feeds.map((item) => ({
      label: item.user.username,
      value: item.user.username,
      type: item.user.type
    }));
    
    options.sort((a, b) => {
      return (a.type !== b.type) ? a.type.localeCompare(b.type) : a.value.localeCompare(b.value);
    });
        
    let myFeedUsername = props.user.username;
    options.unshift({ label: MY_FEED_LABEL, value: myFeedUsername, type: 'group' });

    if (this.props.isDirects) {
      // only mutual friends
      options = options.filter(opt => opt.type === 'user');
    }

    this.state = {
      values: (props.defaultFeed ? [props.defaultFeed] : []),
      options: options,
      showFeedsOption: !props.defaultFeed,
      isWarningDisplayed: false
    };
  }

  isGroupsOrDirectsOnly = (values) => {
    let types = {};
    for (let v of values) {
      types[v.type] = v;
    }
    return Object.keys(types).length <= 1;
  }

  selectChanged = (values) => {
    let isWarningDisplayed = !this.isGroupsOrDirectsOnly(values);
    this.setState({ values, isWarningDisplayed });
    this.props.onChange(values.map(item => item.value));
  }

  toggleSendTo = _ => {
    let newShowFeedsOption = !this.state.showFeedsOption;
    this.setState({ showFeedsOption: newShowFeedsOption });
  }

  labelRenderer = (opt) => {
    const icon = (opt.type === 'group') ? 
      ((opt.value !== this.props.user.username) ? <i className="fa fa-users" /> : <i className="fa fa-home" />) 
      : false;
    return <span>{icon} {opt.label}</span>;
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevState.showFeedsOption !== this.state.showFeedsOption && this.state.showFeedsOption) {
      this.refs.selector._openAfterFocus = true;
      this.refs.selector.focus();
    }
  }

  render() {
    const defaultFeed = this.state.values[0];
    const defaultOpt = this.state.options.reduce((found, opt) => (!found && opt.value === defaultFeed) ? opt : found, null);

    return (
      <div className="send-to">
        {!this.state.showFeedsOption && defaultOpt ? (
          <div>
            To:&nbsp;
            <span className="Select-value-label-standalone">{this.labelRenderer(defaultOpt)}</span>
            <a className="p-sendto-toggler" onClick={preventDefault(_=>this.toggleSendTo())}>Add/Edit</a>
          </div>
        ) : (
          <div>
            <Select
              name="select-feeds"
              placeholder={this.props.isDirects ? "Select friends..." : "Select feeds..."}
              value={this.state.values}
              options={this.state.options}
              onChange={this.selectChanged}
              optionRenderer={this.labelRenderer}
              valueRenderer={this.labelRenderer}
              ref="selector"
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
    );
  }
}
