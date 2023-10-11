import { useEffect, useMemo } from 'react';
import cn from 'classnames';
import { CommaAndSeparated, Separated } from '../separated';
import { pluralForm } from '../../utils';
import {
  ACC_BAD_GROUP,
  ACC_BAD_USER,
  ACC_GROUP,
  ACC_ME,
  ACC_NOT_FOUND,
  ACC_USER,
} from './constants';
import styles from './selector.module.scss';

export function SelectorError({ values, isDirect, isEditing, onError }) {
  // We cannot modify the fixed values, so there is no point in reporting errors
  // related to them
  values = values.filter((v) => !v.isFixed);
  const [hasMyFeed, missing, badUsers, badGroups, allUsers, allGroups] = useMemo(
    () => [
      values.some((a) => a.type === ACC_ME),
      values.filter((a) => a.type === ACC_NOT_FOUND),
      values.filter((a) => a.type === ACC_BAD_USER),
      values.filter((a) => a.type === ACC_BAD_GROUP),
      values.filter((a) => a.type === ACC_BAD_USER || a.type === ACC_USER),
      values.filter((a) => a.type === ACC_BAD_GROUP || a.type === ACC_GROUP),
    ],
    [values],
  );

  const errors = [];
  let stillError = false;
  if (missing.length === 1) {
    errors.push(
      <span key="missing">
        Account <strong>@{missing[0].value}</strong> doesn&#x2019;t exist.
      </span>,
    );
  } else if (missing.length > 1) {
    errors.push(
      <span key="missing">
        Accounts{' '}
        <CommaAndSeparated>
          {missing.map((a) => (
            <strong key={a.value}>@{a.value}</strong>
          ))}
        </CommaAndSeparated>{' '}
        don&#x2019;t exist.
      </span>,
    );
  }

  if (isDirect && hasMyFeed) {
    errors.push(<span key="self">You can&#x2019;t send a direct message to yourself.</span>);
  }

  if (isDirect && allGroups.length > 0) {
    errors.push(
      <span key="all-groups">
        You can&#x2019;t send direct message to groups (
        <CommaAndSeparated>
          {allGroups.map((a) => (
            <strong key={a.value}>@{a.value}</strong>
          ))}
        </CommaAndSeparated>
        ).
      </span>,
    );
  }

  if (isDirect && badUsers.length > 0) {
    errors.push(
      <span key="bad-users">
        You can&#x2019;t send direct messages to{' '}
        <CommaAndSeparated>
          {badUsers.map((a) => (
            <strong key={a.value}>@{a.value}</strong>
          ))}
        </CommaAndSeparated>
        .
      </span>,
    );
  }

  if (!isDirect && badGroups.length > 0) {
    errors.push(
      <span key="bad-groups">
        You are not a member of the{' '}
        <CommaAndSeparated>
          {badGroups.map((a) => (
            <strong key={a.value}>@{a.value}</strong>
          ))}
        </CommaAndSeparated>{' '}
        {pluralForm(badGroups.length, 'group', null, 'w')}.
      </span>,
    );
  }

  if (!isDirect && allUsers.length > 0) {
    errors.push(<span key="bad-users">You can&#x2019;t mix feeds and users as destinations.</span>);
  }

  if (!isDirect && values.length === 0) {
    errors.push(<span key="no-feeds">Please select at least one destination feed.</span>);
  }

  if (isDirect && values.length === 0 && !isEditing) {
    // Don't display error message but still treat it as an error
    stillError = true;
  }

  useEffect(() => onError?.(errors.length > 0 || stillError), [errors.length, stillError, onError]);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={cn('alert alert-danger', styles['alert'])} role="alert">
      <Separated separator=" ">{errors}</Separated>
    </div>
  );
}
