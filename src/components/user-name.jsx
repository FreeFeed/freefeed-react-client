import React from 'react'
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

class UserName extends React.Component {
  constructor(props, context){
    super(props, context)
  }
  render(){
    return (
      <a href={`../${this.props.user.username}`} onClick={preventDefault()} className='user-name-info be-fe-nameFixed' dangerouslySetInnerHTML={display(this.context.settings.userNameMode, this.props.user)}/>
    )
  }
}

UserName.contextTypes = {
  settings: React.PropTypes.object
}

export default UserName