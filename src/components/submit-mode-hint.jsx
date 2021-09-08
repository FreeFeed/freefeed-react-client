import { useEffect } from 'react';
import cn from 'classnames';
import { useSelector } from 'react-redux';

import { submittingByEnter } from '../services/appearance';
import { useBool } from './hooks/bool';

export function SubmitModeHint({ input, className }) {
  const submitMode = useSelector((state) => state.submitMode);
  const byEnter = submittingByEnter(submitMode);
  const [isFocused, , on, off] = useBool(false);
  useEffect(() => {
    if (!input.current) {
      return;
    }
    const el = input.current;
    el.addEventListener('focus', on);
    el.addEventListener('blur', off);

    document.activeElement === el && on();

    return () => (el.removeEventListener('focus', on), el.removeEventListener('blur', off));
  }, [input, on, off]);

  return (
    <span className={cn(className, 'submit-mode-hint', isFocused && 'submit-mode-hint--visible')}>
      ({byEnter ? 'Enter' : 'Ctrl+Enter'} to submit)
    </span>
  );
}
