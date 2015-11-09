import React from 'react'
import Linkify from'react-linkify'
import UserName from './user-name'
import {preventDefault} from '../utils'
import Textarea from 'react-textarea-autosize'

export default class PostComment extends React.Component{
  render() {
    const isSinglePost = this.props.isSinglePost

    return (
    <div className='comment p-comment'>
      <a className='date' title={this.props.createdAgo}>
        <i className='fa fa-comment-o icon'></i>
      </a>
      <div className='body p-comment-body'>
        {this.props.isEditing ? (<div className='edit'>
                        <div>
                          <Textarea
                            autoFocus={!isSinglePost}
                            ref='commentText'
                            className='edit-comment-area'
                            defaultValue={this.props.editText}
                            onKeyDown={this.checkSave}
                            style={{ overflow: 'hidden', wordWrap: 'break-word' }}
                            minRows={2}
                            maxRows={10}
                            />
                        </div>
                        <div className='comment-actions'>
                          {this.props.isSinglePost? (
                            <span>
                              <button className='btn btn-default btn-xs comment-post' onClick={this.saveComment}>Comment</button>
                              &nbsp;
                            </span>
                            ) : (
                            <span>
                              <button className='btn btn-default btn-xs comment-post' onClick={this.saveComment}>Post</button>
                              &nbsp;
                              <a className='comment-cancel' onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>Cancel</a>
                              &nbsp;
                            </span>
                          )}

                          {this.props.isSaving ? (
                                <span className="throbber">
                                  <img width="16" height="16" src='/assets/images/throbber.gif'/>
                                </span>
                              ) : false}
                        </div>
                        {this.props.errorString ? (<div className='comment-error'>{this.props.errorString}</div>) : false}
                    </div>)
        :
              (<span>
                  <span className='comment-text'>
                    <Linkify properties={{target: '_blank'}}>{this.props.body}</Linkify>
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
    if(!this.props.isSaving){
      this.props.saveEditingComment(this.props.id, this.refs.commentText.value)
    }
  }
  checkSave = (event) => {
    const isEnter = event.keyCode === 13
    const isShiftPressed = e.shiftKey
    if (isEnter && !isShiftPressed) {
      event.preventDefault()
      this.saveComment()
    }
  }
}