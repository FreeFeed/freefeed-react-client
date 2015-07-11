import React from 'react';
import FluxComponent from 'flummox/component';
import {Link} from 'react-router';

export default class Signin extends React.Component {
  render() {
    if (!this.props.got_response || this.props.authenticated) {
      return (<noscript/>)
    }

    return (
      <div className="signin-toolbar">
        <Link to="session.new">Sign In</Link>
      </div>
    )
  }
}
