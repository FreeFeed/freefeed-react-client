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
                        <textarea
                          ref='commentText'
                          defaultValue={this.props.editText}
                          className='edit-comment-area'
                          rows='2'
                          onKeyDown={this.checkSave}
                          style={{overflow: 'hidden', wordWrap: 'break-word', resize: 'horizontal', height: '44px'}}
                        />
                      </div>
                      <div className='p-comment-actions'>
                        <button className='p-comment-post' onClick={this.saveComment}>Update</button>
                        &nbsp;
                        <a className='p-comment-cancel' onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>Cancel</a>
                      </div>
                      {this.props.errorString ? (<div className='comment-error'>{this.props.errorString}</div>) : false}
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
  saveComment = () => {
    this.props.saveEditingComment(this.props.id, this.refs.commentText.value)
  }
  checkSave = (event) => {
    const isEnter = event.keyCode === 13
    if (isEnter) {
      event.preventDefault()
      this.saveComment()
    }
  }
}