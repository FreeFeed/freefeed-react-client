import { useSyncExternalStore } from 'react';
import { hasDraft, subscribeToDrafts } from '../../services/drafts';
import { ButtonLink } from '../button-link';
import style from './draft-indicator.module.scss';

export function DraftIndicator({
  draftKey,
  onClick,
  fallback = null,
  children = 'Continue editing',
}) {
  const draftExists = useSyncExternalStore(subscribeToDrafts, () => hasDraft(draftKey));

  if (draftExists) {
    return (
      <ButtonLink
        className={style.indicator}
        onClick={onClick}
        title="Continue writing your saved draft"
      >
        {children}
      </ButtonLink>
    );
  }
  return fallback;
}
