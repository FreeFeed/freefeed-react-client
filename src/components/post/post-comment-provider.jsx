import { commentIdContext, postIdContext } from './post-comment-ctx';

export function CommentProvider({ id, children }) {
  return <commentIdContext.Provider value={id}>{children}</commentIdContext.Provider>;
}

export function PostProvider({ id, children }) {
  return <postIdContext.Provider value={id}>{children}</postIdContext.Provider>;
}
