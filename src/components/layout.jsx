import React from 'react'
import {Link} from 'react-router'
import {connect } from 'react-redux'

import {unauthenticated} from '../redux/action-creators'
import Footer from './footer'
import Sidebar from './sidebar'
import LoaderContainer from './loader-container'

const InternalLayout = ({authenticated, children}) => (
  <div className={authenticated ? 'col-md-9' : 'col-md-12'}>
    <div className='content'>
      {children}
    </div>
  </div>
)


const Layout = (props) => (
  <div className='container'>
    <div className='row header-row'>
      <div className='col-md-4'>
        <div className='header'>
          <h1 className='title'>
            <Link to='/'>FreeFeed-beta</Link>
          </h1>
        </div>
      </div>

      <div className='col-md-8'>
        <div className='row'>
          <div className='col-md-6 search-field'>
            <div className='form-inline'>
            {/*<input className='form-control input-sm search-input p-search-input' />
            <button className='btn btn-default btn-sm p-search-action'>Search</button>*/}
            </div>
          </div>
          <div className='col-md-6'>
            {props.authenticated ? false : (
              <div className='signin-toolbar'>
                <Link to='/signin'>Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <LoaderContainer loading={props.loadingView} fullPage={true}>
      <div className='row'>
        <InternalLayout {...props}/>
        {props.authenticated ? <Sidebar {...props}/> : false}
      </div>
    </LoaderContainer>

    <div className='row'>
      <div className='col-md-12'>
      <Footer/>
      </div>
    </div>
  </div>
)

function select(state) {
  return {
    user: state.user,
    authenticated: state.authenticated,
    loadingView: state.routeLoadingState,
    recentGroups: state.recentGroups,
  }
}

function mapDispatchToProps(dispatch){
  return {
    signOut: ()=>dispatch(unauthenticated())
  }
}

export default connect(select, mapDispatchToProps)(Layout)
