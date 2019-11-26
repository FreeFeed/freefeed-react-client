import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { updateGroup, updateGroupPicture, resetGroupUpdateForm } from '../redux/action-creators';
import GroupSettingsForm from './group-settings-form';
import GroupPictureForm from './group-picture-form';
import { Throbber, BIG } from './throbber';

const GroupSettings = (props) =>
  props.groupSettings.status === 'loading' ? (
    <div className="box">
      <div className="box-header-timeline">Group settings</div>
      <div className="box-body">
        <Throbber size={BIG} />
      </div>
    </div>
  ) : props.groupSettings.status === 'success' ? (
    <div className="box">
      <div className="box-header-timeline">
        <Link to={`/${props.group.username}`}>{props.group.username}</Link>: group settings
      </div>
      <div className="box-body">
        <GroupSettingsForm
          group={props.group}
          updateGroup={props.updateGroup}
          resetGroupUpdateForm={props.resetGroupUpdateForm}
          {...props.groupSettingsForm}
        />

        <hr />

        <GroupPictureForm
          group={props.group}
          updateGroupPicture={props.updateGroupPicture}
          resetGroupUpdateForm={props.resetGroupUpdateForm}
          {...props.groupPictureForm}
        />
      </div>
    </div>
  ) : props.groupSettings.status === 'error' ? (
    <div className="box">
      <div className="box-header-timeline">Group settings</div>
      <div className="box-body">
        <div className="alert alert-danger">{props.groupSettings.errorMessage}</div>
      </div>
    </div>
  ) : (
    <div />
  );

function mapStateToProps(state, ownProps) {
  return {
    group: _.find(state.users, { username: ownProps.params.userName }) || {},
    groupSettings: state.groupSettings,
    groupSettingsForm: state.groupSettingsForm,
    groupPictureForm: state.groupPictureForm,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateGroup: (...args) => dispatch(updateGroup(...args)),
    updateGroupPicture: (...args) => dispatch(updateGroupPicture(...args)),
    resetGroupUpdateForm: (...args) => dispatch(resetGroupUpdateForm(...args)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupSettings);
