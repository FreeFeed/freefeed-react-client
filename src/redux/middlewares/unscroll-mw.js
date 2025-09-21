import { unscroll } from '../../services/unscroll';

export const unscrollMiddleware = () => (next) => (action) => {
  const result = next(action);
  unscroll();
  return result;
};
