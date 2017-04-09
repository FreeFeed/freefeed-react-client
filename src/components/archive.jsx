import React from 'react';
import {connect} from 'react-redux';

import {archiveRestoreActivity, archiveStartRestoration, resetArchiveForms} from '../redux/action-creators';
import ArchiveActivityForm from './archive-activity-form';
import ArchiveRestorationForm from './archive-restoration-form';

class Archive extends React.Component {
  componentWillUnmount() {
    this.props.resetArchiveForms();
  }

  render() {
    const {archives} = this.props;
    if (!archives) {
      return (
        <p>
          We do not have any records about your old Friendfeed account. If you think this is a mistake,
          write to us: <a href="mailto:freefeed.net@gmail.com">freefeed.net@gmail.com</a>.
        </p>
      );
    }
    return (
      <div className="content">
        <div className="box">
          <div className="box-header-timeline">
            Clio Archives
          </div>
          <div className="box-body">
            <p>
              Some text about Clio and archives.
            </p>
            <h3>Your archived posts</h3>
            {this.renderRestorationForm()}
            <h3>Your comments and likes</h3>
            {this.renderActivityForm()}
          </div>
        </div>
      </div>
    );
  }

  renderActivityForm() {
    const {archives, archiveRestoreActivity, archiveActivityFormState} = this.props;
    if (archives && !archives.restore_comments_and_likes) {
      return <ArchiveActivityForm action={archiveRestoreActivity} formState={archiveActivityFormState} />;
    }
    return (
      <p>
        You were allow to restore your comments and likes under other people's posts.
      </p>
    );
  }

  renderRestorationForm() {
    const {archives, archiveStartRestoration, archiveRestorationFormState} = this.props;

    if (!archives.has_archive) {
      return (
        <p>
          We have not archive of your Friendfeed account (<code>{archives.old_username}</code>).
          If you think this is a mistake,
          write to us: <a href="mailto:freefeed.net@gmail.com">freefeed.net@gmail.com</a>.
        </p>
      );
    }

    if (archives.recovery_status === 0) {
      return (
        <ArchiveRestorationForm
          sources={archives.via_sources}
          action={archiveStartRestoration}
          formState={archiveRestorationFormState}
          />
      );
    }

    if (archives.recovery_status === 1) {
      return (
        <p>
          Your archive restoration is in progress. Requests are handled manually, so be prepared to wait a bit.
        </p>
      );
    }

    return (
      <p>
        Your archive is already restored. Thank you!
      </p>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    archives: state.user.privateMeta.archives,
    archiveActivityFormState: state.archiveActivityForm,
    archiveRestorationFormState: state.archiveRestorationForm,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    archiveStartRestoration: (params) => dispatch(archiveStartRestoration(params)),
    archiveRestoreActivity: () => dispatch(archiveRestoreActivity()),
    resetArchiveForms: () => dispatch(resetArchiveForms()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Archive);
