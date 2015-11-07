import React from 'react'
import {Link} from 'react-router'
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

const UserName = (props, context) => (
  <Link to={`/${props.user.username}`}
     className='user-name-info be-fe-nameFixed'
     dangerouslySetInnerHTML={display(context.settings.userNameMode, props.user)}/>
)

UserName.contextTypes = {
  settings: React.PropTypes.object
}

export default UserName