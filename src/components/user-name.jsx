import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {preventDefault} from '../utils'

const DisplayUsername = ({mode, user}) => {
  switch(mode){
    case 'screen':{
      return <span>{user.screenName}</span>
    }
    case 'user':{
      return <span>{user.username}</span>
    }
  }

  return <span>{`${user.screenName} `}<span className='be-fe-username'>{user.username}</span></span>
}

const UserName = (props) => (
  <Link
    className={`user-name-info ${props.className}`}
    to={`/${props.user.username}`}
  >
    <DisplayUsername mode={props.settings.userNameMode} user={props.user}/>
  </Link>
)

const mapStateToProps = (state) =>{
  return {
    settings: state.user.settings
  }
}

export default connect(mapStateToProps)(UserName)
