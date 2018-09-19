import React from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';

const MY_FEED_LABEL = 'My feed';

const Select = Loadable({
  loading: ({ error }) => {
    if (error) {
      console.error(`Cannot load 'react-select'`, error);  // eslint-disable-line no-console
      return <div>Cannot load selector</div>;
    }
    return <div>Loading selector...</div>;
  },
  loader: () => import('react-select'),
  render(loaded, props) {
    const { Creatable } = loaded;
    return <Creatable {...props} />;
  }
});

class SendTo extends React.Component {
  selector;

  constructor(props) {
    super(props);
    this.state = this.stateFromProps(props, this.optionsFromProps(props));
  }

  componentWillReceiveProps(newProps) {
    const options = this.optionsFromProps(newProps);
    if (this.props.defaultFeed !== newProps.defaultFeed ||
      options.length !== 0 && this.state.options.length === 0) {
      this.setState(this.stateFromProps(newProps, options));
    } else {
      this.setState({ options });
    }
  }

  get values() {
    return this.state.values.map((item) => item.value);
  }

  stateFromProps(props, options) {
    const values = options.filter((opt) => opt.value === props.defaultFeed);
    if (values.length === 0 && props.defaultFeed) {
      values.push({
        label: props.defaultFeed,
        value: props.defaultFeed,
      });
    }
    return {
      values,
      options,
      showFeedsOption: !props.defaultFeed || props.alwaysShowSelect,
      isIncorrectDestinations: false
    };
  }

  get isIncorrectDestinations() {
    return this.state.isIncorrectDestinations;
  }

  optionsFromProps({ feeds, user: { username }, isDirects, excludeMyFeed }) {
    const options = feeds.map(({ user: { username, type } }) => ({
      label: username,
      value: username,
      type,
    }));

    options.sort((a, b) => (a.type !== b.type) ? a.type.localeCompare(b.type) : a.value.localeCompare(b.value));

    if (!excludeMyFeed) {
      // use type "group" for "my feed" option to hide the warning about direct message visibility
      options.unshift({ label: MY_FEED_LABEL, value: username, type: 'group' });
    }

    // only mutual friends on Directs page
    return isDirects ? options.filter((opt) => opt.type === 'user') : options;
  }

  isGroupsOrDirectsOnly(values) {
    const types = {};
    for (const v of values) {
      types[v.type] = v;
    }
    return Object.keys(types).length <= 1;
  }

  selectChanged = (values) => {
    const isIncorrectDestinations = !this.isGroupsOrDirectsOnly(values);
    this.setState({ values, isIncorrectDestinations }, () => {
      this.props.onChange && this.props.onChange(values.map((item) => item.value));
    });
  };

  toggleSendTo = () => {
    const newShowFeedsOption = !this.state.showFeedsOption;
    this.setState({ showFeedsOption: newShowFeedsOption });
  };

  labelRenderer = (opt) => {
    const icon = (opt.type === 'group') ?
      ((opt.value !== this.props.user.username) ? <i className="fa fa-users" /> : <i className="fa fa-home" />)
      : false;
    return <span>{icon} {opt.label}</span>;
  };

  promptTextCreator = (label) => `Send direct message to @${label}`;

  registerSelector = (el) => {
    this.selector = el;
  };

  render() {
    const [defaultOpt] = this.state.values;

    return (
      <div className="send-to">
        {!this.state.showFeedsOption && defaultOpt ? (
          <div>
            To:&nbsp;
            <span className="Select-value-label-standalone">{this.labelRenderer(defaultOpt)}</span>
            <a className="p-sendto-toggler" onClick={this.toggleSendTo}>Add/Edit</a>
          </div>
        ) : (
          <div>
            <Select
              name="select-feeds"
              placeholder={this.props.isDirects ? "Select recipients..." : "Select feeds..."}
              value={this.state.values}
              options={this.state.options}
              onChange={this.selectChanged}
              optionRenderer={this.labelRenderer}
              valueRenderer={this.labelRenderer}
              ref={this.registerSelector}
              multi={true}
              clearable={false}
              autoFocus={this.state.showFeedsOption && !this.props.disableAutoFocus && !this.props.isDirects}
              openOnFocus={true}
              promptTextCreator={this.promptTextCreator}
            />
            {this.state.isIncorrectDestinations ? (
              <div className="selector-warning">
                Unable to create a direct message: direct messages could be sent to user(s) only. Please create a regular post for publish it in your feed or groups.
              </div>
            ) : false}
          </div>
        )}
      </div>
    );
  }
}

function selectState({ sendTo: { feeds } }) {
  return { feeds };
}

export default connect(selectState, null, null, { withRef:true })(SendTo);
