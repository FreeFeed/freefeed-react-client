import { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

/**
 * @type {import('react').Context<string|null>}
 */
export const commentIdContext = createContext(null);

export function useComment() {
  const id = useContext(commentIdContext);
  return useSelector((state) => state.comments[id] ?? null);
}

/**
 * @type {import('react').Context<string|null>}
 */
export const postIdContext = createContext(null);

export function usePost() {
  const id = useContext(postIdContext);
  return useSelector((state) => state.posts[id] ?? null);
}
