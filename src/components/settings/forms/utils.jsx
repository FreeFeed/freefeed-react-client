import React from 'react';

export function RadioInput({ field, value, ...additionalProps }) {
  const props = { ...field.input, checked: field.input.value === value, value, ...additionalProps };
  return <input type="radio" {...props} />;
}

export function CheckboxInput({ field, ...additionalProps }) {
  const props = { ...field.input, checked: field.input.value, ...additionalProps };
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
