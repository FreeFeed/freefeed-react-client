import React from 'react'
import PostText from'./post-text'
import UserName from './user-name'
import {preventDefault} from '../utils'
import {fromNowOrNow} from '../utils'
import Textarea from 'react-textarea-autosize'
import throbber16 from 'assets/images/throbber-16.gif'

export default class PostComment extends React.Component{
  render() {
    const createdAgo = fromNowOrNow(+this.props.createdAt)

    return (
    <div className="comment">
      <a className="comment-icon fa fa-comment-o" title={createdAgo}></a>
      {this.props.isEditing ? (
        <div className="comment-body">
          <div>
            <Textarea
              autoFocus={!this.props.isSinglePost}
              ref="commentText"
              className="comment-textarea"
              defaultValue={this.props.editText}
              onKeyDown={this.checkSave}
              style={{ overflow: 'hidden', wordWrap: 'break-word' }}
              minRows={2}
              maxRows={10}
            />
          </div>
          {this.props.isSinglePost ? (
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Comment</button>
            </span>
          ) : (
            <span>
              <button className="btn btn-default btn-xs comment-post" onClick={this.saveComment}>Post</button>
              <a className="comment-cancel" onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>Cancel</a>
            </span>
          )}
          {this.props.isSaving ? (
            <span className="comment-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
          {this.props.errorString ? (
            <span className="comment-error">{this.props.errorString}</span>
          ) : false}
        </div>
      ) : (
        <div className="comment-body">
          <PostText text={this.props.body}/>
          {' -'}&nbsp;
          <UserName user={this.props.user}/>
          {this.props.isEditable ? (
            <span>
              {' '}(<a onClick={preventDefault(_=>this.props.toggleEditingComment(this.props.id))}>edit</a>
              &nbsp;|&nbsp;
              <a onClick={preventDefault(_=>this.props.deleteComment(this.props.id))}>delete</a>)
            </span>
          ) : false}
        </div>
      )}
    </div>
  )}
  saveComment = () => {
    if (!this.props.isSaving) {
      this.props.saveEditingComment(this.props.id, this.refs.commentText.value)
      this.refs.commentText.value = ''
    }
  }
  checkSave = (event) => {
    const isEnter = event.keyCode === 13
    const isShiftPressed = event.shiftKey
    if (isEnter && !isShiftPressed) {
      event.preventDefault()
      this.saveComment()
    }
  }
}
