import { Component } from 'react';
import { connect } from 'react-redux';

import {
  archiveRestoreActivity,
  archiveStartRestoration,
  resetArchiveForms,
} from '../redux/action-creators';
import ArchiveActivityForm from './archive-activity-form';
import ArchiveRestorationForm from './archive-restoration-form';

class Archive extends Component {
  componentWillUnmount() {
    this.props.resetArchiveForms();
  }

  render() {
    const { archives } = this.props;
    if (!archives) {
      return (
        <div className="content">
          <div className="box">
            <div className="box-header-timeline" role="heading">
              Restore from FriendFeed.com Archives
            </div>
            <div className="box-body">
              <p>
                We do not have any records about your old FriendFeed account. If you think this is a
                mistake, please contact us at{' '}
                <a href="mailto:freefeed.net@gmail.com">freefeed.net@gmail.com</a>.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="content">
        <div className="box">
          <div className="box-header-timeline" role="heading">
            Restore from FriendFeed.com Archives
          </div>
          <div className="box-body">
            <p>
              In April 2015, before FriendFeed was shut down, a group of volunteers had created an
              archive of posts for 5356 users and 1231 groups of FriendFeed.com. These archives are
              available at{' '}
              <a href="https://clio.freefeed.net/" target="_blank" rel="noreferrer">
                clio.freefeed.net
              </a>
              .
            </p>
            <p>
              If you have an archive of your posts at{' '}
              <a href="https://clio.freefeed.net/" target="_blank" rel="noreferrer">
                clio.freefeed.net
              </a>
              , you can now restore it to FreeFeed.
            </p>
            <p>
              Please note that all restore requests are processed manually and may take a few days
              to complete.
            </p>
            <p>
              <a href="https://dev.freefeed.net/w/archives-faq/" target="_blank" rel="noreferrer">
                Restore from archives FAQ
              </a>{' '}
              (in Russian)
            </p>
            <h3>Restore your comments and likes</h3>
            {this.renderActivityForm()}
            <h3>Restore your posts</h3>
            {this.renderRestorationForm()}
          </div>
        </div>
      </div>
    );
  }

  renderActivityForm() {
    const { archives, archiveRestoreActivity, archiveActivityFormState } = this.props;
    if (archives && !archives.restore_comments_and_likes) {
      return (
        <ArchiveActivityForm action={archiveRestoreActivity} formState={archiveActivityFormState} />
      );
    }
    return <p>You allowed to restore your comments and likes of other users’ posts.</p>;
  }

  renderRestorationForm() {
    const { archives, archiveStartRestoration, archiveRestorationFormState } = this.props;

    if (!archives.has_archive) {
      return (
        <p>
          We do not have archive of your FriendFeed account (<code>{archives.old_username}</code>).
          If you think this is a mistake, please contact us at{' '}
          <a href="mailto:freefeed.net@gmail.com">freefeed.net@gmail.com</a>.
        </p>
      );
    }

    if (archives.recovery_status === 0) {
      return (
        <ArchiveRestorationForm
          sources={archives.via_sources}
          oldUsername={archives.old_username}
          action={archiveStartRestoration}
          formState={archiveRestorationFormState}
        />
      );
    }

    if (archives.recovery_status === 1) {
      return (
        <p>
          Your archive restoration is in progress. Requests are processed manually and may take a
          few days to complete.
        </p>
      );
    }

    return <p>Your archive has been restored. Thank you!</p>;
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
