import React from 'react';
import FluxComponent from 'flummox/component';

class Hello extends React.Component {
  render() {
    return(<p>Hello, {this.props.user.get('screenName')}</p>)
  }
}

class HomeHandler extends React.Component {
  static async routerWillRun({flux, state}) {
    let authActions = flux.getActions('auth');
    await authActions.getWhoami()
  }

  async handleNewAuth() {
    let actions = this.props.flux.getActions('auth');
    await actions.getWhoami();
  }

  render() {
    return (
      <div>
        <h2>What is Freefeed?</h2>
        <FluxComponent connectToStores={{
          auth: store => ({
            user: store.getUser()
          })
        }}>
          <Hello />
        </FluxComponent>
        <a href="https://about.freefeed.net">Read here!</a>
      </div>
    )
  }
}

export default HomeHandler
