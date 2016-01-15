import React from 'react'
import Post from './post'

export default (props) => {
  const getEntryComponent = section => post => {
    const isRecentlyHidden = (post.isHidden && (section === 'visible'))

    return (
      <Post {...post}
        key={post.id}
        user={props.user}
        isInHomeFeed={props.isInHomeFeed}
        isInUserFeed={props.isInUserFeed}
        isRecentlyHidden={isRecentlyHidden}
        showMoreComments={props.showMoreComments}
        showMoreLikes={props.showMoreLikes}
        toggleEditingPost={props.toggleEditingPost}
        cancelEditingPost={props.cancelEditingPost}
        saveEditingPost={props.saveEditingPost}
        deletePost={props.deletePost}
        addAttachmentResponse={props.addAttachmentResponse}
        toggleCommenting={props.toggleCommenting}
        addComment={props.addComment}
        likePost={props.likePost}
        unlikePost={props.unlikePost}
        hidePost={props.hidePost}
        unhidePost={props.unhidePost}
        disableComments={props.disableComments}
        enableComments={props.enableComments}
        commentEdit={props.commentEdit}/>
    )
  }

  const visibleEntries = props.visibleEntries.map(getEntryComponent('visible'))
  const hiddenEntries = (props.hiddenEntries || []).map(getEntryComponent('hidden'))

  let toggleLink
  const entriesForm = (hiddenEntries.length > 1 ? 'entries' : 'entry')
  if (props.isHiddenRevealed) {
    const text = <span>Don't show {hiddenEntries.length} hidden {entriesForm}</span>
    toggleLink = <a onClick={props.toggleHiddenPosts}>&#x25bc; {text}</a>
  } else {
    const text = <span>Show {hiddenEntries.length} hidden {entriesForm}</span>
    toggleLink = <a onClick={props.toggleHiddenPosts}>&#x25ba; {text}</a>
  }

  return (
    <div className="posts">
      {visibleEntries}

      {hiddenEntries.length > 0 ? (
        <div>
          <div className="hidden-posts-toggle">{toggleLink}</div>
          {props.isHiddenRevealed ? hiddenEntries : false}
        </div>
      ) : false}
    </div>
  )
}
