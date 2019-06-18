import React from "react";
import ReactDOM from "react-dom";
import { Link } from 'react-router';
import { preventDefault } from "../utils";
import { Throbber } from "./throbber";


export default class UserNotificationsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sendNotificationsDigest: this.props.backendPreferences.sendNotificationsDigest || false,
      sendDailyBestOfDigest:   this.props.backendPreferences.sendDailyBestOfDigest || false,
      sendWeeklyBestOfDigest:  this.props.backendPreferences.sendWeeklyBestOfDigest || false,
    };
  }

  componentDidMount() {
    if (window.location.hash === "#notifications") {
      const node = ReactDOM.findDOMNode(this);
      setTimeout(() => window.scrollTo(0, node.getBoundingClientRect().bottom), 500);
    }
  }

  render() {
    return (
      <form onSubmit={preventDefault(this.savePreference)}>
        <h3><a className="setting-link" href="#notifications">Notifications preferences</a></h3>

        <p>Email me:</p>

        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              name="dailyMessages"
              value="1"
              checked={this.state.sendNotificationsDigest}
              onChange={this.toggleNotifications}
            />
            Daily unread notifications
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              name="dailyBestOfMessages"
              value="1"
              checked={this.state.sendDailyBestOfDigest}
              onChange={this.toggleDailyBestOfDigest}
            />
            Daily <Link to="/summary/1">Best of Day</Link>
          </label>
        </div>

        <div className="checkbox">
          <label>
            <input
              type="checkbox"
              name="weeklyBestOfMessages"
              value="1"
              checked={this.state.sendWeeklyBestOfDigest}
              onChange={this.toggleWeeklyBestOfDigest}
            />
            Weekly <Link to="/summary/7">Best of Week</Link>
          </label>
        </div>

        <p>
          <button className="btn btn-default" type="submit">Update</button>
          {this.props.status === "loading" ? (
            <span className="settings-throbber">
              <Throbber />
            </span>
          ) : false}
        </p>

        {this.props.status === "success" ? (
          <div className="alert alert-info" role="alert">Updated!</div>
        ) : this.props.status === "error" ? (
          <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
        ) : false}

      </form>
    );
  }

  toggleNotifications = (e) => {
    this.setState({ sendNotificationsDigest: e.target.checked });
  };

  toggleDailyBestOfDigest = (e) => {
    this.setState({ sendDailyBestOfDigest: e.target.checked });
  };

  toggleWeeklyBestOfDigest = (e) => {
    this.setState({ sendWeeklyBestOfDigest: e.target.checked });
  };

  savePreference = () => {
    if (this.props.status !== "loading") {
      this.props.updateUserNotificationPreferences(this.props.userId,
        {
          sendNotificationsDigest: this.state.sendNotificationsDigest,
          sendDailyBestOfDigest:   this.state.sendDailyBestOfDigest,
          sendWeeklyBestOfDigest:  this.state.sendWeeklyBestOfDigest
        });
    }
  };
}
