import cn from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { ButtonLink } from '../button-link';
import { prepareAsyncFocus } from '../../utils/prepare-async-focus';
import { DisplayOption, useSelectedOptions } from './options';

// Local styles
import {
  ACC_GROUP,
  ACC_USER,
  CREATE_DIRECT,
  EDIT_DIRECT,
  isEditing,
  EDIT_REGULAR,
  ACC_BAD_GROUP,
  ACC_BAD_USER,
  ACC_ME,
} from './constants';
import styles from './selector.module.scss';
import { SelectorError } from './error';
import { AccountsSelector } from './accounts-selector';

export function Selector({ className, mode, feedNames, fixedFeedNames = [], onChange, onError }) {
  const { values, meOption, groupOptions, userOptions } = useSelectedOptions(
    feedNames,
    fixedFeedNames,
  );

  const isDirect = useMemo(() => {
    if (mode === EDIT_REGULAR || mode === EDIT_DIRECT) {
      return mode === EDIT_DIRECT;
    }
    const hasGroupOrHome = values.some(
      (v) => v.type === ACC_GROUP || v.type === ACC_BAD_GROUP || v.type === ACC_ME,
    );
    const hasUser = values.some((v) => v.type === ACC_USER || v.type === ACC_BAD_USER);

    if (hasGroupOrHome) {
      return false;
    } else if (hasUser) {
      return true;
    }

    return null;
  }, [mode, values]);

  const options = useMemo(() => {
    const directOptions = [
      {
        label: 'Direct recipients',
        options: userOptions,
      },
    ];
    const regularOptions = [
      meOption,
      {
        label: 'Groups you’re in',
        options: groupOptions,
      },
    ];

    if (isDirect === true) {
      return directOptions;
    } else if (isDirect === false) {
      return regularOptions;
    }

    if (mode === CREATE_DIRECT) {
      return [...directOptions, ...regularOptions];
    }
    return [...regularOptions, ...directOptions];
  }, [groupOptions, isDirect, meOption, mode, userOptions]);

  const startStatic = useMemo(() => isEditing(mode) || values.length > 0, [mode, values.length]);
  const [showStatic, setShowStatic] = useState(startStatic);

  const toggleSelector = useCallback(() => {
    prepareAsyncFocus();
    setShowStatic(false);
  }, []);

  const handleChange = useCallback(
    (opts, action) => {
      if (action.removedValue?.isFixed) {
        return;
      }
      onChange(opts.map((o) => o.value));
    },
    [onChange],
  );

  const formatCreateLabel = useCallback(
    (label) => (isDirect ? `Add @${label} as recipient` : `Post to @${label}`),
    [isDirect],
  );

  return (
    <div className={styles['container']}>
      <div
        className={cn(className, styles['box'], styles['palette'])}
        aria-label="Choose post destination"
      >
        {showStatic ? (
          <>
            <span className={styles['box-item']}>To:</span>
            {values.length === 0 && <span className={styles['nobody']}>nobody</span>}
            {values.map((opt) => (
              <DisplayOption
                key={opt.value}
                className={cn(styles['box-item'], styles['dest-item'])}
                option={opt}
                context="value"
              />
            ))}
            <ButtonLink className={styles['box-item']} onClick={toggleSelector}>
              Add/Edit
            </ButtonLink>
          </>
        ) : (
          <AccountsSelector
            placeholder={
              isDirect || mode === CREATE_DIRECT ? 'Select recipients...' : 'Select feeds...'
            }
            autoFocus={startStatic}
            openMenuOnFocus={!isEditing(mode)}
            options={options}
            value={values}
            onChange={handleChange}
            formatCreateLabel={formatCreateLabel}
          />
        )}
      </div>
      <SelectorError
        values={values}
        isDirect={isDirect !== null ? isDirect : mode === CREATE_DIRECT}
        onError={onError}
        isEditing={isEditing(mode)}
      />
    </div>
  );
}
