import { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux';

import { getSinglePostBody, getSingleComment} from '../redux/action-creators';

/**
 * @param {string} id
*/

export function getCommentBody(id) {
  const dispatch = useDispatch();
  useEffect(() => void dispatch(getSingleComment(id)), [dispatch, id]);
  return useSelector((state) => {
    return {
      cmBody: state.comments[id],
      ownUsername: state.user.username,
    };  
  }); 
}

export function getPostBody(id) {
  const dispatch = useDispatch();
  useEffect(() => void dispatch(getSinglePostBody(id)), [dispatch, id]);
  return useSelector((state) => {
    return {
      psBody: state.posts[id],
      ownUsername: state.user.username,
    };  
  });
}

export function SingleComment({id = null}) {
  if (id) {
    const { cmBody, ownUsername } = getCommentBody(id);
    var commentBody = {};
    Object.assign(commentBody, cmBody);
    return <div class="post-notif"><span dir="auto" class="Linkify" role="region">{commentBody.body?.replace('@' + ownUsername, '')}</span></div>
  } else {
    return null
  } 
}

export function SinglePost({id = null}) {
  if (id) {
    const { psBody, ownUsername } = getPostBody(id);
    var postBody = {};
    Object.assign(postBody, psBody);
    return <div class="post-notif"><span dir="auto" class="Linkify" role="region">{postBody.body?.replace('@' + ownUsername, '')}</span></div>
  } else {
    return null
  }
}
