import React from 'react';
import { connect } from 'react-redux';
import { toggleRealtime, updateUserPreferences, home } from '../redux/action-creators';

const getStatusIcon = (active, status) => {
  if (status === 'loading') {
    return 'refresh';
  }
  return active ? 'pause' : 'play';
};

class RealtimeSwitch extends React.PureComponent {
  handleSwitch = () => {
    this.props.toggle(this.props.userId, this.props.frontendPreferences);
  };

  render() {
    const { props } = this;
    const { realtimeActive } = this.props.frontendPreferences;

    return (
      <div className="realtime-switch" onClick={this.handleSwitch}>
        {realtimeActive ? false : 'Paused'}
        <span className={`glyphicon glyphicon-${getStatusIcon(realtimeActive, props.status)}`} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userId:              state.user.id,
    frontendPreferences: state.user.frontendPreferences,
    status:              state.frontendRealtimePreferencesForm.status,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggle: (userId, frontendPreferences) => {
      const { realtimeActive } = frontendPreferences;
      //send a request to change flag
      dispatch(updateUserPreferences(userId, { ...frontendPreferences, realtimeActive: !realtimeActive }));
      //set a flag to show
      dispatch(toggleRealtime());
      if (!realtimeActive) {
        dispatch(home());
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(RealtimeSwitch);
