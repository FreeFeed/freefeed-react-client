import React from 'react';
import {connect} from 'react-redux';

import {createGroup, resetGroupCreateForm} from '../redux/action-creators';
import GroupCreateForm from './group-create-form';

const GroupCreate = (props) => (
  <div className="box">
    <div className="box-header-timeline">
      Create a group
    </div>
    <div className="box-body">
      <GroupCreateForm
        createGroup={props.createGroup}
        resetGroupCreateForm={props.resetGroupCreateForm}
        {...props.groupCreateForm}/>
    </div>
  </div>
);

function mapStateToProps(state) {
  return {
    groupCreateForm: state.groupCreateForm
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createGroup: (...args) => dispatch(createGroup(...args)),
    resetGroupCreateForm: (...args) => dispatch(resetGroupCreateForm(...args))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupCreate);
