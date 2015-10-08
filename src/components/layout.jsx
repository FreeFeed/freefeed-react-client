import React from 'react'
import { Link} from 'react-router'
import { connect } from 'react-redux'

import {unauthenticated} from '../redux/action-creators'
import Footer from './footer'
import Sidebar from './sidebar'
import Signin from './signin'

const InternalLayout = (props) => (
  <div className={props.authenticated ? 'col-md-9' : 'col-md-12'}>
    <div className='content'>
      {props.children}
    </div>
  </div>
)


class Layout extends React.Component {
  getChildContext(){
    return {
      settings: this.props.user.settings
    }
  }

  render()
   {
    return (
     <div className='container'>
       <div className='row header-row'>
         <div className='col-md-4'>
           <div className='header'>
             <h1 className='title'>
               <Link to='timeline.home'>freefeed</Link>
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
               {!this.props.gotResponse || this.props.authenticated ? false : (<Signin {...this.props}/>)}
             </div>


           </div>
         </div>
       </div>

       <div className='row'>
         <InternalLayout {...this.props}/>
         {this.props.authenticated ? <Sidebar {...this.props}/> : false}
       </div>

       <div className='row'>
         <div className='col-md-12'>
           <Footer/>
         </div>
       </div>
     </div>
    )
  }
}

Layout.childContextTypes = {settings: React.PropTypes.object}

function select(state) {
  return state
}

function mapDispatchToProps(dispatch){
  return {
    signOut: ()=>dispatch(unauthenticated())
  }
}

export default connect(select, mapDispatchToProps)(Layout)
