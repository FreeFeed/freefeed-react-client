import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {preventDefault} from '../utils'

const display = (mode, user) => {
  switch(mode){
    case 'screen':{
      return {__html: user.screenName}
    }
    case 'user':{
      return {__html:user.username}
    }
  }
  return {__html:`${user.screenName} <span class='be-fe-username'>(${user.username})</span>`}
}

const UserName = (props) => (
  <Link to={`/${props.user.username}`}
     className='user-name-info be-fe-nameFixed'
     dangerouslySetInnerHTML={display(props.settings.userNameMode, props.user)}/>
)

const mapStateToProps = (state) =>{
  return {
    settings: state.user.settings
  }
}

export default connect(mapStateToProps)(UserName)