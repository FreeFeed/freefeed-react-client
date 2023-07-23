import { commentIdContext } from './comment-ctx';

export function CommentProvider({ id, children }) {
  return <commentIdContext.Provider value={id}>{children}</commentIdContext.Provider>;
}
