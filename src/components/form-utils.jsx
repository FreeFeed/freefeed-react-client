import React, { useCallback } from 'react';
import { without } from 'lodash';

// Helpers for use with react-final-form-hooks

export function RadioInput({ field, value, ...additionalProps }) {
  const props = { ...field.input, checked: field.input.value === value, value, ...additionalProps };
  return <input type="radio" {...props} />;
}

export function CheckboxInput({ field, ...additionalProps }) {
  const props = { ...field.input, checked: field.input.value, ...additionalProps };
  return <input type="checkbox" {...props} />;
}

/**
 * The field.input.value is array, the checked checkbox means the given value is
 * in this array.
 */
export function CheckboxInputMulti({ field, value, ...additionalProps }) {
  const checked = field.input.value.includes(value);
  const onChange = useCallback(() => {
    const vals = field.input.value;
    if (vals.includes(value)) {
      field.input.onChange(without(vals, value));
    } else {
      field.input.onChange([...vals, value]);
    }
  }, [field.input, value]);
  const props = { ...field.input, checked, value, onChange, ...additionalProps };
  return <input type="checkbox" {...props} />;
}

export function groupErrClass(field, whenTouched = false, baseClass = 'form-group') {
  return (
    baseClass +
    (field.meta.error !== undefined && (!whenTouched || field.meta.touched) ? ' has-error' : '')
  );
}

export function errorMessage(field, whenTouched = false) {
  return (
    field.meta.error !== undefined &&
    (!whenTouched || field.meta.touched) && <p className="help-block">{field.meta.error}</p>
  );
}

export function shouldBe(test, message = '') {
  return test ? undefined : message;
}
