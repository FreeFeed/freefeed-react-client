import React from 'react'
import {preventDefault} from '../utils'
import Textarea from 'react-textarea-autosize'

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props)
    this.state = {disabled: true}
  }

  createPost = _ => {
    this.props.createPost(this.refs.postText.value)
    this.refs.postText.value = ''
    this.setState({disabled: true})
  }

  checkCreatePostAvailability = (e) => {
    this.setState({disabled: e.target.value === ''})
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
          <Textarea className='edit-post-area'
                    ref='postText'
                    onChange={this.checkCreatePostAvailability}
                    minRows={2}
                    maxRows={10}
                    onKeyDown={this.checkSave}/>
        </div>
          <div className='row'>
            <div className='pull-right'>

              {this.props.createPostViewState.isPending ? (
                <span className="throbber">
                  <img width="16" height="16" src='/assets/images/throbber.gif'/>
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
