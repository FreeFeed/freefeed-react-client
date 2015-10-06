import React from 'react'
import Linkify from'react-linkify'
import UserName from './user-name'
import {preventDefault} from '../utils'

export default class PostComment extends React.Component{
  render() {
    return (
    <div className='comment p-comment'>
      <a className='date' title={this.props.createdAgo}>
        <i className='fa fa-comment-o icon'></i>
      </a>
      <div className='body p-comment-body'>
        {this.props.isEditing ? (<div className='edit'>
                      <div>
                        <textarea ref='commentText' defaultValue={this.props.editText} className='edit-comment-area' rows='2' style={{overflow: 'hidden', wordWrap: 'break-word', resize: 'horizontal', height: '44px'}}></textarea>
                      </div>
                      <div className='p-comment-actions'>
                        <button className='p-comment-post' onClick={_=>this.props.saveEditingComment(this.props.id, this.refs.commentText.value)}>Post</button>
                        <a className='p-comment-cancel' onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>Cancel</a>
                      </div>
                      {props.errorString ? (<div className='comment-error'>{props.errorString}</div>) : false}
                    </div>)
        :
              (<span>
                  <span className='comment-text'>
                    <Linkify>{this.props.body}</Linkify>
                  </span>
                  &nbsp;-&nbsp;
                  <span className='author'>
                   <UserName user={this.props.user}/>
                  </span>
                </span>)}


        {this.props.isEditable && !this.props.isEditing ? (<span className='controls'>
                &nbsp;(
                <a onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>edit</a>
                &nbsp;|&nbsp;
                <a onClick={preventDefault(_=>this.props.deleteComment(this.props.id))}>delete</a>
                )
              </span>) : false}
      </div>
    </div>
  )}
}