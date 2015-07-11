import React from 'react';
import {RouteHandler, Link} from 'react-router';
import FluxComponent from 'flummox/component';

import Footer from './footer.jsx';
import Sidebar from './sidebar.jsx';
import Signin from './signin.jsx';

class InternalLayout extends React.Component {
  render() {
    if (!this.props.got_response || !this.props.authenticated) {
      return (
        <div className="col-md-12">
          <div className="content">
            <RouteHandler/>
          </div>
        </div>
      )
    } else {
      return (
        <div className="col-md-9">
          <div className="content">
            <RouteHandler/>
          </div>
        </div>
      )
    }
  }
}

export default class Layout extends React.Component {
  render() {
    return (
      <div className="container">
        <div className="row header-row">
          <div className="col-md-4">
            <div className="header">
              <h1 className="title">
                <Link to="timeline.home">freefeed</Link>
              </h1>
            </div>
          </div>

          <div className="col-md-8">
            <div className="row">
              <div className="col-md-6 search-field">
                <div className="form-inline">
                  {/*<input className="form-control input-sm search-input p-search-input" />
                   <button className="btn btn-default btn-sm p-search-action">Search</button>*/}
                </div>
              </div>

              <div className="col-md-6">
                <Signin />
              </div>


            </div>
          </div>
        </div>

        <div className="row">
          <FluxComponent connectToStores={{
            auth: store => ({
              got_response: store.state.got_response,
              authenticated: store.state.authenticated,
            })
          }}>
            <InternalLayout/>
          </FluxComponent>
          <Sidebar/>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Footer/>
          </div>
        </div>
      </div>
    );
  }
}
