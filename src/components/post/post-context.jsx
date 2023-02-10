import { createContext, useMemo, useState } from 'react';

export const PostContext = createContext({ input: null, setInput: () => {} });

export function PostContextProvider({ children }) {
  const [input, setInput] = useState(null);
  const ctxVal = useMemo(() => ({ input, setInput }), [input]);

  return <PostContext.Provider value={ctxVal}>{children}</PostContext.Provider>;
}
