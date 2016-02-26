import React from 'react'
import {preventDefault} from '../utils'
import throbber16 from 'assets/images/throbber-16.gif'

const updatePreferences = props => _ => {
  if (props.status !== 'loading') {
    props.updateFrontendRealtimePreferences(props.userId, {realtimeActive: props.realtimeActive})
  }
}

export default (props) => (
  <form onSubmit={preventDefault(updatePreferences(props))}>
    <h3>Realtime preferences</h3>

    <div className="checkbox">
      <label>
        <input type="checkbox" name="realtimeActive" value="1" checked={props.realtimeActive} onChange={props.toggleRealtime}/>
        Show new posts on Home feed in real time
      </label>
    </div>

    <p>
      <button className="btn btn-default" type="submit">Update</button>
      {props.status === 'loading' ? (
        <span className="settings-throbber">
          <img width="16" height="16" src={throbber16}/>
        </span>
      ) : false}
    </p>

    {props.status === 'success' ? (
      <div className="alert alert-info" role="alert">Updated!</div>
    ) : props.status === 'error' ? (
      <div className="alert alert-danger" role="alert">{props.errorMessage}</div>
    ) : false}
  </form>
)