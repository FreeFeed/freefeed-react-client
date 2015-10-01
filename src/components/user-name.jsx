import React from 'react'
import {preventDefault} from '../utils'

const display = (mode, user) => {
  switch(mode){
    case 'screen':{
      return user.screenName
    }
    case 'user':{
      return user.username
    }
  }
  return `${user.screenName} (${user.username})`
}

class UserName extends React.Component {
  constructor(props, context){
    super(props, context)
  }
  render(){
    return (
      <a href={`../${this.props.user.username}`} onClick={preventDefault()} className='user-name-info'>
        {display(this.context.settings.userNameMode, this.props.user)}
      </a>
    )
  }
}

UserName.contextTypes = {
  settings: React.PropTypes.object
}

export default UserName