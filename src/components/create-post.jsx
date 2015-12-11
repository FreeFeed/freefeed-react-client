import React from 'react'
import {preventDefault} from '../utils'
import Textarea from 'react-textarea-autosize'
import throbber from 'assets/images/throbber.gif'
import SendTo from './send-to'

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      disabled: true
    }
  }

  createPost = _ => {
    let postText = this.refs.postText.value
    let feeds = this.refs.selectFeeds.values

    this.props.createPost(postText, feeds)
    
    this.refs.postText.value = ''
    this.setState({
      disabled: true
    })
  }

  isPostTextEmpty = (postText) => {
    return postText == '' || /^\s+$/.test(postText)
  }

  checkCreatePostAvailability = (e) => {
    let isPostDisabled = this.isPostTextEmpty(this.refs.postText.value)
                      || this.refs.selectFeeds.values == 0

    this.setState({
      disabled: (isPostDisabled)
    })
  }

  checkSave = (e) => {
    const isEnter = e.keyCode === 13
    const isShiftPressed = e.shiftKey
    if (isEnter && !isShiftPressed) {
      e.preventDefault()
      if (!this.state.disabled && !this.props.createPostViewState.isPending){
        this.createPost()
      }
    }
  }

  render() {
    return (
      <div className='create-post p-timeline-post-create'>
        <div className='p-create-post-view'>
          {this.props.sendTo.expanded ? (
            <SendTo ref="selectFeeds"
                    feeds={this.props.sendTo.feeds}
                    user={this.props.user} 
                    onChange={this.checkCreatePostAvailability}/>
          ) : false}

          <Textarea className='edit-post-area'
                    ref='postText'
                    onChange={this.checkCreatePostAvailability}
                    minRows={3}
                    maxRows={10}
                    onKeyDown={this.checkSave}
                    onFocus={this.props.expandSendTo}/>
        </div>
          <div className='row'>
            <div className='pull-right'>

              {this.props.createPostViewState.isPending ? (
                <span className="throbber">
                  <img width="16" height="16" src={throbber}/>
                </span>
              ) : false}

              <button className='btn btn-default btn-xs create-post-action'
                      onClick={preventDefault(this.createPost)}
                      disabled={this.state.disabled || this.props.createPostViewState.isPending}>Post</button>
            </div>
          </div>

          {this.props.createPostViewState.isError ? (
            <div className='create-post-error'>
              {this.props.createPostViewState.errorString}
            </div>
          ) : false}
      </div>
    )
  }
}
