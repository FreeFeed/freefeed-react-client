import React from "react";
import ReactDOM from "react-dom";
import {preventDefault} from "../utils";
import throbber16 from "../../assets/images/throbber-16.gif";

export default class UserNotificationsForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sendNotificationsDigest: this.props.backendPreferences.sendNotificationsDigest || false,
    };
  }

  componentDidMount() {
    if (window.location.hash === "#notifications") {
      const node = ReactDOM.findDOMNode(this);
      setTimeout(() => window.scrollTo(0, node.getBoundingClientRect().bottom), 500);
    }
  }

  render() {
    return <form onSubmit={preventDefault(this.savePreference)}>
      <h3><a className="setting-link" href="#notifications">Notifications preferences</a></h3>

      <p>Email me:</p>

      <div className="checkbox">
        <label>
          <input type="checkbox"
            name="dailyMessages"
            value="1"
            checked={this.state.sendNotificationsDigest}
            onChange={this.toggleNotifications}
          />
          Daily unread notifications
        </label>
      </div>

      <p>
        <button className="btn btn-default" type="submit">Update</button>
        {this.props.status === "loading" ? (
          <span className="settings-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </p>

      {this.props.status === "success" ? (
        <div className="alert alert-info" role="alert">Updated!</div>
      ) : this.props.status === "error" ? (
        <div className="alert alert-danger" role="alert">{this.props.errorMessage}</div>
      ) : false}

    </form>;
  }

  toggleNotifications = (e) => {
    this.setState({sendNotificationsDigest: e.target.checked});
  }

  savePreference = () => {
    if (this.props.status !== "loading") {
      this.props.updateUserNotificationPreferences(this.props.userId, {sendNotificationsDigest: this.state.sendNotificationsDigest});
    }
  }
}
