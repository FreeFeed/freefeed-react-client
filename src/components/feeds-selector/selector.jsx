import cn from 'classnames';
import { useCallback, useMemo } from 'react';
import CreatableSelect from 'react-select/creatable';
import { ButtonLink } from '../button-link';
import { useBool } from '../hooks/bool';
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
} from './constants';
import styles from './selector.module.scss';
import { SelectorError } from './error';

export function Selector({ className, mode, feedNames, fixedFeedNames = [], onChange, onError }) {
  const { values, meOption, groupOptions, userOptions } = useSelectedOptions(
    feedNames,
    fixedFeedNames,
  );

  const isDirect = useMemo(() => {
    if (mode === EDIT_REGULAR || mode === EDIT_DIRECT) {
      return mode === EDIT_DIRECT;
    }
    const hasGroup = values.some((v) => v.type === ACC_GROUP || v.type === ACC_BAD_GROUP);
    const hasUser = values.some((v) => v.type === ACC_USER || v.type === ACC_BAD_USER);

    if (hasGroup) {
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
        label: 'Groups',
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
  const [showStatic, toggleSelector] = useBool(startStatic);

  const handleChange = useCallback(
    (opts, action) => {
      if (action.removedValue?.isFixed) {
        return;
      }
      onChange(opts.map((o) => o.value));
    },
    [onChange],
  );

  return (
    <div className={styles['container']}>
      <div className={cn(className, styles['box'])} aria-label="Choose post destination">
        {showStatic ? (
          <>
            <span className={styles['box-item']}>To:</span>
            {values.length === 0 && <span className={styles['nobody']}>nobody</span>}
            {values.map((opt) => (
              <DisplayOption
                key={opt.value}
                className={cn(styles['box-item'], styles['dest-item'])}
                option={opt}
              />
            ))}
            <ButtonLink className={styles['box-item']} onClick={toggleSelector}>
              Add/Edit
            </ButtonLink>
          </>
        ) : (
          <CreatableSelect
            className={styles['selector']}
            theme={selTheme}
            placeholder={
              isDirect || mode === CREATE_DIRECT ? 'Select recipients...' : 'Select feeds...'
            }
            isMulti={true}
            isClearable={false}
            autoFocus={startStatic}
            closeMenuOnSelect={true}
            openMenuOnFocus={!isEditing(mode)}
            options={options}
            value={values}
            styles={selStyles}
            onChange={handleChange}
            formatOptionLabel={formatOptionLabel}
            formatCreateLabel={formatCreateLabel}
            isValidNewOption={isValidNewOption}
          />
        )}
      </div>
      <SelectorError
        values={values}
        isDirect={isDirect || mode === CREATE_DIRECT}
        onError={onError}
        isEditing={isEditing(mode)}
      />
    </div>
  );
}

const selStyles = {
  control: (base, state) => ({
    ...base,
    boxShadow: 'none',
    '&:hover': { borderColor: 'var(--selector-color-neutral60)' },
    borderColor: state.isFocused ? 'var(--selector-color-neutral60)' : base.borderColor,
  }),
  multiValueLabel: (base, state) => {
    const s = { ...base, color: 'currentColor' };
    return state.data.isFixed ? { ...s, paddingRight: 6 } : s;
  },
  multiValueRemove: (base, state) => {
    const s = {
      ...base,
      borderLeft: '1px solid var(--selector-color-primary50)',
      marginLeft: '4px',
    };
    return state.data.isFixed ? { ...s, display: 'none' } : s;
  },
  indicatorSeparator: (base) => ({ ...base, display: 'none' }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--selector-color-primary25)',
    color: 'var(--selector-color-value)',
    borderRadius: '2px',
    border: '1px solid var(--selector-color-primary50)',
  }),
};

// Only valid usernames are allowed
function isValidNewOption(label) {
  return /^[a-z\d]{3,25}$/i.test(label.trim());
}

function formatCreateLabel(label) {
  return `Send direct message to @${label}`;
}

function formatOptionLabel(option) {
  return <DisplayOption option={option} />;
}

const selTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: {
    danger: 'var(--selector-color-danger)',
    dangerLight: 'var(--selector-color-danger-light)',
    neutral0: 'var(--selector-color-neutral0)',
    neutral5: 'var(--selector-color-neutral5)',
    neutral10: 'var(--selector-color-neutral10)',
    neutral20: 'var(--selector-color-neutral20)',
    neutral30: 'var(--selector-color-neutral30)',
    neutral40: 'var(--selector-color-neutral40)',
    neutral50: 'var(--selector-color-neutral50)',
    neutral60: 'var(--selector-color-neutral60)',
    neutral70: 'var(--selector-color-neutral70)',
    neutral80: 'var(--selector-color-neutral80)',
    neutral90: 'var(--selector-color-neutral90)',
    primary: 'var(--selector-color-primary)',
    primary25: 'var(--selector-color-primary25)',
    primary50: 'var(--selector-color-primary50)',
    primary75: 'var(--selector-color-primary75)',
  },
});
