import React from 'react'
import {connect} from 'react-redux'

import {Link} from 'react-router'
import {unsubscribeFromGroup, makeGroupAdmin,
        unadminGroupAdmin} from '../redux/action-creators'

import {tileUserListFactory, WITH_REMOVE_AND_MAKE_ADMIN_HANDLES, WITH_REMOVE_ADMIN_RIGHTS} from './tile-user-list'
const SubsList = tileUserListFactory({type: WITH_REMOVE_AND_MAKE_ADMIN_HANDLES})
const AdminsList = tileUserListFactory({type: WITH_REMOVE_ADMIN_RIGHTS})

const ManageSubscribersHandler = (props) => {
  const remove = (username) => props.unsubscribeFromGroup(props.username, username)
  const makeAdmin = (user) => props.makeGroupAdmin(props.username, user)
  const removeAdminRights = (user) => props.unadminGroupAdmin(props.username, user)

  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div className="row">
          <div className="col-md-6">
            <Link to={`/${props.username}`}>{props.username}</Link> › Manage subscribers
          </div>
          <div className="col-md-6 text-right">
            <Link to={`/${props.username}/subscribers`}>Browse subscribers</Link>
          </div>       
        </div>
        <div>
          {props.users
            ? <div>
                <h3>Subscribers</h3>
                <SubsList users={props.users}
                          makeAdmin={makeAdmin}
                          remove={remove}/>
              </div>
          : false}

          {props.groupAdmins
            ? <div>
                <h3>Admins</h3>
                <AdminsList users={props.groupAdmins}
                            removeAdminRights={removeAdminRights}/>
              </div>
          : false}
        </div>
      </div>
      <div className='box-footer'></div>
    </div>
  )
}

function selectState(state) {
  const boxHeader = state.boxHeader
  const username = state.router.params.userName
  const groupAdmins = state.groupAdmins
  const usersWhoAreNotAdmins = _.filter(state.usernameSubscribers.payload, user => {
    return groupAdmins.find(u => u.username == user.username) == null
  })
  const users = _.sortBy(usersWhoAreNotAdmins, 'username')

  return { boxHeader, username, groupAdmins, users }
}

function selectActions(dispatch) {
  return {
    unsubscribeFromGroup: (...args) => dispatch(unsubscribeFromGroup(...args)),
    makeGroupAdmin: (...args) => dispatch(makeGroupAdmin(...args)),
    unadminGroupAdmin: (...args) => dispatch(unadminGroupAdmin(...args))
  }
}

export default connect(selectState, selectActions)(ManageSubscribersHandler)
