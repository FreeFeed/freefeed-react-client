import { parse as qsParse } from 'querystring';
import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isEmail from 'validator/lib/isEmail';
import cn from 'classnames';
import { useForm, useField } from 'react-final-form-hooks';
import { restorePassword } from '../redux/action-creators';
import { FieldsetWrapper } from './fieldset-wrapper';
import { Throbber } from './throbber';

export default React.memo(function RestorePasswordPage() {
  return (
    <div className="box">
      <div className="box-header-timeline">Welcome to FreeFeed!</div>
      <div className="box-body">
        <div className="col-md-12">
          <h2 className="p-signin-header">Reset FreeFeed password</h2>
          <p>
            Please enter your email address and we will send you email with password reset link.
          </p>
          <RestorePasswordForm />
        </div>
      </div>
      <div className="box-footer" />
    </div>
  );
});

const RestorePasswordForm = React.memo(function RestorePasswordForm() {
  const status = useSelector((state) => state.restorePasswordStatus);
  const dispatch = useDispatch();

  const form = useForm({
    onSubmit(values) {
      dispatch(restorePassword(values.email));
    },
    validate(values) {
      return { email: isEmail(values.email.trim()) ? undefined : 'Required' };
    },
    initialValues: {
      email: useMemo(() => {
        if (location.search) {
          const { email } = qsParse(location.search.substr(1));
          return email || '';
        }
        return '';
      }, []),
    },
  });

  const email = useField('email', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <FieldsetWrapper disabled={status.loading}>
        <div className={cn('form-group', email.meta.touched && email.meta.invalid && 'has-error')}>
          <label htmlFor="email-input" className="control-label">
            E-mail address
          </label>
          <input
            {...email.input}
            id="email-input"
            name="email"
            className="form-control narrow-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
          />
        </div>
        <div className="form-group">
          <button
            className="btn btn-default p-singin-action"
            type="submit"
            disabled={status.loading || form.hasValidationErrors}
          >
            Reset password
          </button>{' '}
          {status.loading && <Throbber />}
        </div>
      </FieldsetWrapper>
      {status.error && (
        <p className="alert alert-danger" role="alert">
          {status.errorText}
        </p>
      )}
      {status.success && (
        <p className="alert alert-success" role="alert">
          Please check your email for password reset instructions. Do not forget to check the Spam
          folder!
        </p>
      )}
    </form>
  );
});
