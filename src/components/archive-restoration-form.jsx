import React from 'react';
import _ from 'lodash';

export default class ArchiveRestorationForm extends React.Component {
  static propTypes = {
    action:    React.PropTypes.func.isRequired,
    formState: React.PropTypes.shape({
      inProgress: React.PropTypes.bool.isRequired,
      success:    React.PropTypes.bool.isRequired,
      error:      React.PropTypes.bool.isRequired,
      errorText:  React.PropTypes.string.isRequired,
    }),
    sources:     React.PropTypes.array.isRequired,
    oldUsername: React.PropTypes.string.isRequired,
  };

  state = {
    disable_comments:      false,
    via_restore:           [],
  };

  setDisableComments = (e) => this.setState({ disable_comments: e.target.checked });
  setViaSource = (e) => {
    const { checked, value } = e.target;
    if (checked) {
      this.setState({ via_restore: _.union(this.state.via_restore, [value]) });
    } else {
      this.setState({ via_restore: _.without(this.state.via_restore, value) });
    }
  };
  selectAllSources = (e) => {
    if (e.target.checked) {
      this.setState({ via_restore: this.props.sources.map((s) => s.url) });
    } else {
      this.setState({ via_restore: [] });
    }
  };

  canSubmit() {
    return this.state.via_restore.length > 0 && !this.props.formState.inProgress;
  }

  action = (e) => {
    e.preventDefault();
    if (this.canSubmit()) {
      this.props.action(this.state);
    }
  };

  render() {
    const { via_restore, disable_comments } = this.state;
    const { formState, sources, oldUsername } = this.props;
    const totalCount = sources.reduce((p, s) => p + s.count, 0);
    const selectedCount = sources.filter((s) => via_restore.includes(s.url)).reduce((p, s) => p + s.count, 0);

    const buttonText = (totalCount === selectedCount) ? 'Restore all my posts'
      : (selectedCount === 0) ? 'Restore my posts'
        : `Restore my ${selectedCount} ${selectedCount === 1 ? 'post' : 'posts'}`;

    return (
      <form onSubmit={this.action}>
        <p>
            You have {totalCount} posts in your <strong>friendfeed.com/{oldUsername}</strong> archive.
            Posts from which source would you like to restore?
        </p>
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={via_restore.length === sources.length} onClick={this.selectAllSources} />
              Restore all {totalCount} posts (or select specific sources below)
          </label>
        </div>
        <SourceList
          sources={sources}
          selected={via_restore}
          onClick={this.setViaSource}
        />
        <div className="checkbox">
          <label>
            <input type="checkbox" checked={disable_comments} onClick={this.setDisableComments} />
              Disable new comments for your posts restored from archive
              (you can enable comments for individual posts after the restoring has been completed)
          </label>
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-default"
            disabled={!this.canSubmit()}
          >
            {buttonText}
          </button>
        </div>
        {formState.error ? (
          <div className="alert alert-danger" role="alert">{formState.errorText}</div>
        ) : false}
        <p>
          <em>Requests are handled manually, so be prepared to wait a bit.</em>
        </p>
      </form>
    );
  }
}

const FRF_URL = 'http://friendfeed.com';

class SourceList extends React.Component {
  static propTypes = {
    sources:  React.PropTypes.array.isRequired,
    selected: React.PropTypes.array.isRequired,
    onClick:  React.PropTypes.func.isRequired,
  };

  renderSource({ name, url }) {
    if (url === FRF_URL) {
      return <span>Posts on FriendFeed</span>;
    }
    if (url.indexOf(FRF_URL) === 0) {
      return <span>FriendFeed: {name}</span>;
    }
    return (
      <span>
        {name}
        <a href={url} title={url} target="_blank" className="source-link"><i className="fa fa-external-link-square" /></a>
      </span>
    );
  }

  render() {
    const { selected, onClick } = this.props;
    const sources = this.props.sources.sort((a, b) => {
      if (a.url === FRF_URL) { return -1; }
      if (b.url === FRF_URL) { return 1; }
      return b.count - a.count;
    });
    return (
      <div className="archive-source-list">
        {sources.map((s) => (
          <div className="checkbox" key={s.url}>
            <label>
              <input type="checkbox" value={s.url} checked={selected.includes(s.url)} onClick={onClick} />
              {this.renderSource(s)} <span className="text-muted">({s.count})</span>
            </label>
          </div>
        ))}
      </div>
    );
  }
}
