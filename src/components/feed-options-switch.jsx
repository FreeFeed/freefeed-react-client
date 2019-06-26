import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import DropdownMenu from 'react-dd-menu';
import cn from 'classnames';
import { faCheckSquare, faSquare, faDotCircle, faCircle } from '@fortawesome/free-regular-svg-icons';
import * as FeedOptions from '../utils/feed-options';
import { toggleRealtime, updateUserPreferences, home, toggleFeedSort, setHomefeedMode } from '../redux/action-creators';
import { Icon } from './fontawesome-icons';
import { faEllipsis } from './fontawesome-custom-icons';


class FeedOptionsSwitch extends React.PureComponent {
  state = { showDropdown: false, };

  toggleDropdown = () => {
    this.setState({ showDropdown: !this.state.showDropdown });
  };

  toggleRealtime = () => {
    this.props.toggleRealtime(this.props.userId, this.props.frontendPreferences);
  };

  switchSort = (sort) => {
    (this.props.feedViewOptions.sort !== sort) && this.props.toggleFeedSort(this.props.route);
  };

  setFeedMode = (mode) => {
    (mode !== this.props.frontendPreferences.homeFeedMode) && this.props.setHomeFeedMode(mode, this.props.route);
  };

  render() {
    const {
      feedViewOptions,
      atHomeFeed,
      onFirstPage,
      frontendPreferences: {
        realtimeActive,
        homeFeedMode,
      },
    } = this.props;

    const toggle = <Icon icon={faEllipsis} className="dots-icon" onClick={this.toggleDropdown} />;

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
            <DropOption value={FeedOptions.ACTIVITY} current={feedViewOptions.sort} clickHandler={this.switchSort}>
              Order by recent comments/likes
            </DropOption>
            <DropOption value={FeedOptions.CHRONOLOGIC} current={feedViewOptions.sort} clickHandler={this.switchSort}>
              Order by post date
            </DropOption>
            {atHomeFeed && (
              <>
                <div className="spacer" />
                <DropOption value={FeedOptions.HOMEFEED_MODE_FRIENDS_ONLY} current={homeFeedMode} clickHandler={this.setFeedMode}>
                  Show friends posts only
                </DropOption>
                <DropOption value={FeedOptions.HOMEFEED_MODE_CLASSIC} current={homeFeedMode} clickHandler={this.setFeedMode}>
                  Show friends posts, likes and comments
                </DropOption>
                <DropOption value={FeedOptions.HOMEFEED_MODE_FRIENDS_ALL_ACTIVITY} current={homeFeedMode} clickHandler={this.setFeedMode}>
                  Show all friends activity
                </DropOption>
                {onFirstPage && (
                  <>
                    <div className="spacer" />
                    <DropOption value={true} current={realtimeActive} clickHandler={this.toggleRealtime} checkbox>
                      Show new posts in real-time
                    </DropOption>
                  </>
                )}
              </>
            )}
          </div>
        </DropdownMenu>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userId:              state.user.id,
    frontendPreferences: state.user.frontendPreferences,
    status:              state.frontendRealtimePreferencesForm.status,
    feedViewOptions:     state.feedViewOptions,
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
    setHomeFeedMode(mode, route) {
      dispatch(setHomefeedMode(mode));
      browserHistory.push(route || '/');
    },
    toggleFeedSort: (route) => {
      dispatch(toggleFeedSort());
      browserHistory.push(route || '/');
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedOptionsSwitch);

function DropOption({ children, value, current, clickHandler, checkbox = false }) {
  const onClick = useCallback(() => clickHandler(value), [value]);
  const className = cn('drop-option', { 'active': value === current });

  const iconOn = checkbox ? faCheckSquare : faDotCircle;
  const iconOff = checkbox ? faSquare : faCircle;

  return (
    <div className={className} onClick={onClick}>
      <Icon className="check" icon={value === current ? iconOn : iconOff} />
      {children}
    </div>
  );
}
