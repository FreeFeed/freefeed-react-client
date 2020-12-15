import PropTypes from 'prop-types';
import { Component } from 'react';

export default class ArchiveActivityForm extends Component {
  static propTypes = {
    action: PropTypes.func.isRequired,
    formState: PropTypes.shape({
      inProgress: PropTypes.bool.isRequired,
      success: PropTypes.bool.isRequired,
      error: PropTypes.bool.isRequired,
      errorText: PropTypes.string.isRequired,
    }),
  };

  state = { checked: false };

  setChecked = (e) => this.setState({ checked: e.target.checked });

  action = (e) => {
    e.preventDefault();
    if (this.canSubmit()) {
      this.props.action();
    }
  };

  canSubmit() {
    return this.state.checked && !this.props.formState.inProgress;
  }

  render() {
    const { checked } = this.state;
    const { formState } = this.props;
    return (
      <form onSubmit={this.action}>
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={checked} onClick={this.setChecked} />I allow to restore
            my comments and likes of other users’ posts
          </label>
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-default" disabled={!this.canSubmit()}>
            Yes, I allow
          </button>
        </div>
        {formState.error ? (
          <div className="alert alert-danger" role="alert">
            {formState.errorText}
          </div>
        ) : (
          false
        )}
      </form>
    );
  }
}
