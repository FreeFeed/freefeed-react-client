import React from 'react'
import { Link} from 'react-router'
import { connect } from 'react-redux'

import Footer from './footer.jsx'
import Sidebar from './sidebar.jsx'
import Signin from './signin.jsx'

const InternalLayout = (props) => (
  <div className={!props.got_response || !props.authenticated ? 'col-md-12' : 'col-md-9'}>
    <div className="content">
      {props.children}
    </div>
  </div>
)


const Layout = (props) => (
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
            {!props.got_response || props.authenticated ? false : (<Signin {...props}/>)}
          </div>


        </div>
      </div>
    </div>

    <div className="row">
      <InternalLayout {...props}/>
      <Sidebar authenticated={props.authenticated} user={props.me.user}/>
    </div>

    <div className="row">
      <div className="col-md-12">
        <Footer/>
      </div>
    </div>
  </div>
)

function select(state) {
  return state.toJS()
}

export default connect(select)(Layout)
