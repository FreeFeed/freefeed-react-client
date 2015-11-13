import React from 'react'
import FeedPost from './feed-post'

export default (props) => {
  const feed_posts = props.feed.map(post => {
    return (<FeedPost {...post}
              key={post.id}
              user={props.user}
              showMoreComments={props.showMoreComments}
              showMoreLikes={props.showMoreLikes}
              toggleEditingPost={props.toggleEditingPost}
              cancelEditingPost={props.cancelEditingPost}
              saveEditingPost={props.saveEditingPost}
              deletePost={props.deletePost}
              toggleCommenting={props.toggleCommenting}
              addComment={props.addComment}
              likePost={props.likePost}
              unlikePost={props.unlikePost}
              commentEdit={props.commentEdit} />)
  })

  return (<div className='posts'>
            {feed_posts}
          </div>)
}
