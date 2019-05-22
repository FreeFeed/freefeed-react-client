import React from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import DropdownMenu from 'react-dd-menu';
import * as FeedSortOptions from '../utils/feed-sort-options';
import { toggleRealtime, updateUserPreferences, home, toggleFeedSort } from '../redux/action-creators';


class FeedOptionsSwitch extends React.PureComponent {
  state = { showDropdown: false, };

  toggleDropdown = () => {
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  toggleRealtime = () => {
    this.props.toggleRealtime(this.props.userId, this.props.frontendPreferences);
  };

  render() {
    const { props } = this;
    const { realtimeActive } = props.frontendPreferences;
    const { feedSort, showRealtime } = props;

    const toggle = <span className="glyphicon glyphicon-option-horizontal dots-icon" onClick={this.toggleDropdown} />;

    const menuOptions = {
      align:   'right',
      close:   this.toggleDropdown,
      isOpen:  this.state.showDropdown,
      animate: false,
      toggle
    };

    return (
      <div className="feed-options-switch">
        <DropdownMenu {...menuOptions}>
          <div className="dropdown">
            <div className={`drop-option ${feedSort.sort === FeedSortOptions.ACTIVITY && 'active'}`} onClick={this.switchSortToActivity}><span className="check fa fa-check" />Order by recent comments/likes</div>
            <div className={`drop-option ${feedSort.sort === FeedSortOptions.CHRONOLOGIC && 'active'}`} onClick={this.switchSortToChronologic}><span className="check fa fa-check" />Order by post date</div>
            {showRealtime && <div className="spacer" />}
            {showRealtime && <div className={`drop-option ${realtimeActive && 'active'}`} onClick={this.toggleRealtime}><span className="check fa fa-check" />Show new posts in real-time</div>}
          </div>
        </DropdownMenu>
      </div>
    );
  }

  switchSortToActivity = () => {
    if (this.props.feedSort.sort !== FeedSortOptions.ACTIVITY) {
      this.props.toggleFeedSort(this.props.route);
    }
  };

  switchSortToChronologic = () => {
    if (this.props.feedSort.sort !== FeedSortOptions.CHRONOLOGIC) {
      this.props.toggleFeedSort(this.props.route);
    }
  };
}

const mapStateToProps = (state) => {
  return {
    userId:              state.user.id,
    frontendPreferences: state.user.frontendPreferences,
    status:              state.frontendRealtimePreferencesForm.status,
    feedSort:            state.feedSort,
    route:               state.routing.locationBeforeTransitions.pathname,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleRealtime: (userId, frontendPreferences) => {
      const { realtimeActive } = frontendPreferences;
      //send a request to change flag
      dispatch(updateUserPreferences(userId, { ...frontendPreferences, realtimeActive: !realtimeActive }, {}, true));
      //set a flag to show
      dispatch(toggleRealtime());
      if (!realtimeActive) {
        dispatch(home());
      }
    },
    toggleFeedSort: (route) => {
      dispatch(toggleFeedSort());
      browserHistory.push(route || '/');
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedOptionsSwitch);
