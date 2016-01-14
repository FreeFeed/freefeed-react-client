import React from 'react'
import Post from './post'

export default (props) => {
  let visiblePosts = []
  let hiddenPosts = []

  props.feed.forEach(post => {
    const p = (
      <Post {...post}
        key={post.id}
        user={props.user}
        isInHomeFeed={props.isInHomeFeed}
        isInUserFeed={props.isInUserFeed}
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
        commentEdit={props.commentEdit} />
    )

    if (post.isHidden) {
      hiddenPosts.push(p)
    } else {
      visiblePosts.push(p)
    }
  })

  let toggleLink
  const entriesForm = (hiddenPosts.length > 1 ? 'entries' : 'entry')
  if (props.isHiddenRevealed) {
    const text = <span>Don't show {hiddenPosts.length} hidden {entriesForm}</span>
    toggleLink = <a onClick={props.toggleHiddenPosts}>&#x25bc; {text}</a>
  } else {
    const text = <span>Show {hiddenPosts.length} hidden {entriesForm}</span>
    toggleLink = <a onClick={props.toggleHiddenPosts}>&#x25ba; {text}</a>
  }

  return (
    <div className="posts">
      {visiblePosts}

      {hiddenPosts.length > 0 ? (
        <div>
          <div className="hidden-posts-toggle">{toggleLink}</div>
          {props.isHiddenRevealed ? hiddenPosts : false}
        </div>
      ) : false}
    </div>
  )
}
