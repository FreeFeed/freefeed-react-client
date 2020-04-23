import { encode as qsEncode } from 'querystring';
import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useField } from 'react-final-form-hooks';
import { mapValues } from 'lodash';

import { updatePassword } from '../../../redux/action-creators';
import { Throbber } from '../../throbber';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { shouldBe, groupErrClass, errorMessage } from '../../form-utils';

export default function ChangePasswordForm() {
  const dispatch = useDispatch();
  const email = useSelector((state) => state.user.email);
  const formStatus = useSelector((state) => state.settingsForms.updatePasswordStatus);

  const form = useForm(
    useMemo(() => ({ validate, initialValues, onSubmit: onSubmit(dispatch) }), [dispatch]),
  );

  const currentPassword = useField('currentPassword', form.form);
  const password = useField('password', form.form);
  const passwordConfirmation = useField('passwordConfirmation', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <div className={groupErrClass(currentPassword, true)}>
        <label htmlFor="currentPassword-input">Current password</label>
        <input
          id="currentPassword-input"
          className="form-control narrow-input"
          type="password"
          autoComplete="current-password"
          {...currentPassword.input}
        />
        {errorMessage(currentPassword, true)}
      </div>

      <div className={groupErrClass(password, true)}>
        <label htmlFor="password-input">New password</label>
        <input
          id="password-input"
          className="form-control narrow-input"
          type="password"
          autoComplete="new-password"
          {...password.input}
        />
        {errorMessage(password, true)}
      </div>

      <div className={groupErrClass(passwordConfirmation, true)}>
        <label htmlFor="passwordConfirmation-input">Confirm password</label>
        <input
          id="passwordConfirmation-input"
          className="form-control narrow-input"
          type="password"
          autoComplete="new-password"
          {...passwordConfirmation.input}
        />
        {errorMessage(passwordConfirmation, true)}
      </div>

      <div className="form-group">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={formStatus.loading || !form.dirty || form.hasValidationErrors}
        >
          {formStatus.loading ? 'Updating password…' : 'Update password'}
        </button>{' '}
        {formStatus.loading && <Throbber />}
      </div>
      {formStatus.error && (
        <p className="alert alert-danger" role="alert">
          {formStatus.errorText}
        </p>
      )}
      {formStatus.success && (
        <p className="alert alert-success" role="alert">
          Password updated
        </p>
      )}
      <p>
        Or <Link to={`/restore?${qsEncode({ email })}`}>reset your password by email</Link> if you
        forgot your current password
      </p>
    </form>
  );
}

const initialValues = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

function validate(values) {
  const { currentPassword, password, passwordConfirmation } = mapValues(values, (s) => s.trim());
  return {
    currentPassword: shouldBe(currentPassword !== ''),
    password: shouldBe(password.length > 4, password && 'Password is too short'),
    passwordConfirmation: shouldBe(passwordConfirmation === password, 'Passwords are not equal'),
  };
}

function onSubmit(dispatch) {
  return (values) => dispatch(updatePassword(mapValues(values, (s) => s.trim())));
}
