import { useMemo, useState } from 'react';
import { tocContext } from './context';

export function TocProvider({ children }) {
  const [items, setItems] = useState([]);
  const value = useMemo(
    () => ({
      items,
      register: (item) => {
        if (items.some((i) => i.id === item.id)) {
          return;
        }
        setItems((items) => {
          if (items.some((i) => i.id === item.id)) {
            return items;
          }
          return [...items, item];
        });
      },
    }),
    [items, setItems],
  );

  return <tocContext.Provider value={value}>{children}</tocContext.Provider>;
}
