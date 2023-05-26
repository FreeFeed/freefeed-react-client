import cn from 'classnames';
import { lazyComponent } from '../lazy-component';
import { Throbber } from '../throbber';
import styles from './selector.module.scss';
import { DisplayOption } from './options';
import { kbdVariants } from './kbd-layouts';

function Fallback() {
  return (
    <div>
      <Throbber delay={0} /> Loading selector...
    </div>
  );
}

let nativeFilter = () => false;

const FixedSelect = lazyComponent(
  async () => {
    const m = await import('react-select');
    nativeFilter = m.createFilter();
    return m;
  },
  {
    fallback: <Fallback />,
    errorMessage: "Couldn't load selector",
    delay: 0,
  },
);

const CreatableSelect = lazyComponent(
  async () => {
    const [mCreatable, m] = await Promise.all([
      import('react-select/creatable'),
      import('react-select'),
    ]);
    nativeFilter = m.createFilter();
    return mCreatable;
  },
  {
    fallback: <Fallback />,
    errorMessage: "Couldn't load selector",
    delay: 0,
  },
);

export function AccountsSelector({ isCreatable = true, ...props }) {
  const Select = isCreatable ? CreatableSelect : FixedSelect;
  return (
    <Select
      className={cn(styles['selector'], styles['palette'])}
      theme={selTheme}
      isMulti={true}
      isClearable={false}
      closeMenuOnSelect={true}
      styles={selStyles}
      formatOptionLabel={formatOptionLabel}
      isValidNewOption={isValidNewOption}
      filterOption={customFilter}
      {...props}
    />
  );
}

function customFilter(option, input) {
  if (!input) {
    return true;
  }
  for (const variant of kbdVariants(input)) {
    const ok = nativeFilter(option, variant);
    if (ok) {
      return true;
    }
  }
  return false;
}

const themeColors = {
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
  value: 'var(--selector-color-value)',
};

const selTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  colors: themeColors,
});

const selStyles = {
  control: (base, state) => ({
    ...base,
    boxShadow: 'none',
    '&:hover': { borderColor: themeColors.neutral60 },
    borderColor: state.isFocused ? themeColors.neutral60 : base.borderColor,
  }),
  multiValueLabel: (base, state) => {
    const s = { ...base, color: 'currentColor' };
    return state.data.isFixed ? { ...s, paddingRight: 6 } : s;
  },
  multiValueRemove: (base, state) => {
    const s = {
      ...base,
      borderLeft: `1px solid ${themeColors.primary50}`,
      marginLeft: '4px',
    };
    return state.data.isFixed ? { ...s, display: 'none' } : s;
  },
  indicatorSeparator: (base) => ({ ...base, display: 'none' }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: themeColors.primary25,
    color: themeColors.value,
    borderRadius: '2px',
    border: `1px solid ${themeColors.primary50}`,
  }),
};

// Only valid usernames are allowed
function isValidNewOption(label) {
  return /^[a-z\d]{3,25}$/i.test(label.trim());
}

function formatOptionLabel(option, { context }) {
  return <DisplayOption option={option} context={context} />;
}
