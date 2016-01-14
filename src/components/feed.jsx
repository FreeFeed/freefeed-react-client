import React from 'react'
import Post from './post'

export default (props) => {
  const feedPosts = props.feed.map(post => {
    return (
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
  })

  return (
    <div className="posts">
      {feedPosts}
    </div>
  )
}
