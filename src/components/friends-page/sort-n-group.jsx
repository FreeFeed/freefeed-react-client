import { useMemo } from 'react';
import { useBool } from '../hooks/bool';
import { ButtonLink } from '../button-link';

export function useSortNGroup() {
  const [group, toggleGroup] = useBool(true);
  const [sortByDate, toggleSortByDate] = useBool(true);
  const control = useMemo(
    () => (
      <div>
        Sort by:{' '}
        <OnOff active={sortByDate} onClick={toggleSortByDate}>
          date
        </OnOff>
        {' - '}
        <OnOff active={!sortByDate} onClick={toggleSortByDate}>
          username
        </OnOff>
        ; Group by type:{' '}
        <OnOff active={group} onClick={toggleGroup}>
          on
        </OnOff>
        {' - '}
        <OnOff active={!group} onClick={toggleGroup}>
          off
        </OnOff>
      </div>
    ),
    [group, sortByDate, toggleGroup, toggleSortByDate],
  );

  return { group, sortByDate, control };
}

function OnOff({ active, onClick, children }) {
  return active ? (
    <strong tabIndex={0} aria-disabled>
      {children}
    </strong>
  ) : (
    <ButtonLink onClick={onClick}>{children}</ButtonLink>
  );
}
