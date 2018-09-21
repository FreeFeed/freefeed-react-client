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
    const { default: Selectable, Creatable } = loaded;
    if (props.fixedOptions) {
      return <Selectable {...props} />;
    }
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
    const defaultFeeds = [];
    if (props.defaultFeed) {
      if (Array.isArray(props.defaultFeed)) {
        defaultFeeds.push(...props.defaultFeed);
      } else {
        defaultFeeds.push(props.defaultFeed);
      }
    }
    const values = options.filter((opt) => defaultFeeds.includes(opt.value));
    if (values.length === 0 && defaultFeeds.length > 0) {
      values.push(...defaultFeeds.map((f) => ({ label: f, value: f })));
    }
    if (props.isDirects && props.isEditing) {
      // freeze default values
      for (const val of values) {
        if (defaultFeeds.includes(val.value)) {
          val.clearableValue = false;
        }
      }
    }
    return {
      values,
      options,
      showFeedsOption: defaultFeeds.length === 0 || props.alwaysShowSelect || props.isEditing,
      isIncorrectDestinations: false
    };
  }

  get isIncorrectDestinations() {
    return this.state.isIncorrectDestinations;
  }

  optionsFromProps({ feeds, user: { username }, isDirects, excludeMyFeed, isEditing }) {
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
    if (isDirects) {
      return options.filter((opt) => opt.type === 'user');
    }
    if (isEditing) {
      return options.filter((opt) => opt.type === 'group');
    }
    return options;
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
              fixedOptions={this.props.isEditing && !this.props.isDirects}
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
