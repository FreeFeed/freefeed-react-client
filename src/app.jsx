import React from 'react';
import {RouteHandler, Link} from 'react-router';

import Footer from './footer.jsx';

var Layout = React.createClass({
  render: function () {
    return (
      <div className="container">
        <div className="row header-row">
          <div className="col-md-4">
            <div className="header">
              <h1 className="title">
                <Link to="timeline.home" query={{offset: "0"}}>freefeed</Link>
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
                <div className="signin-toolbar">
                  <Link to="session.new">Sign In</Link>
                </div>
              </div>


            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="content">
              <div className="box">
                <div className="box-header-timeline">
                  Hello
                </div>
                <div className="box-body">
                  <RouteHandler/>
                </div>
                <div className="box-footer">

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Footer/>
          </div>
        </div>
      </div>
    );
  }
});

export default React.createClass({
  render: function() {
    return (
      <Layout />
    );
  }
})
