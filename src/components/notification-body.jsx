import { useEffect } from 'react';
import { useDispatch, useSelector} from 'react-redux';
import PieceOfText from './piece-of-text';

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
    };  
  }); 
}

export function getPostBody(id) {
  const dispatch = useDispatch();
  useEffect(() => void dispatch(getSinglePostBody(id)), [dispatch, id]);
  return useSelector((state) => {
    return {
      psBody: state.posts[id],
    };  
  });
}

export function SingleComment({id = null}) {
  if (id) {
    const { cmBody } = getCommentBody(id);
    var commentBody = {};
    Object.assign(commentBody, cmBody);
    return <div class="Linkify post-notif" dir="auto" role="region"><PieceOfText text={commentBody.body} /></div>
  } else {
    return null
  } 
}

export function SinglePost({id = null}) {
  if (id) {
    const { psBody } = getPostBody(id);
    var postBody = {};
    Object.assign(postBody, psBody);
    return <div class="Linkify post-notif" dir="auto" role="region"><PieceOfText text={postBody.body} /></div>
  } else {
    return null
  }
}