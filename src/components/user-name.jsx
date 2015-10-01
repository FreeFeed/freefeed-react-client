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

export default (props) => (
  <a href={`../${props.user.username}`} onClick={preventDefault()} className='user-name-info'>
    {display(props.mode, props.user)}
  </a>
)
