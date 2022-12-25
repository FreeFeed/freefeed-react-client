/* global CONFIG */
import { useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useSelector, useDispatch } from 'react-redux';
import isEmail from 'validator/lib/isEmail';

import { Throbber } from '../../throbber';
import { updateUser } from '../../../redux/action-creators';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { shouldBe, errorMessage, groupErrClass } from '../../form-utils';
import { useServerInfo } from '../../hooks/server-info';
import { EmailVerificationSubform } from '../../email-verification-subform';
import styles from './forms.module.scss';

export default function ProfileForm() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const formStatus = useSelector((state) => state.settingsForms.updateProfileStatus);
  const [serverInfo, serverInfoStatus] = useServerInfo();

  const emailVerificationEnabled = serverInfoStatus.success && serverInfo.emailVerificationEnabled;

  const form = useForm(
    useMemo(
      () => ({
        validate: validate({ emailVerificationEnabled, initialEmail: userData.email }),
        initialValues: initialValues(userData),
        onSubmit: onSubmit(userData.id, dispatch),
      }),
      [dispatch, emailVerificationEnabled, userData],
    ),
  );

  const screenName = useField('screenName', form.form);
  const email = useField('email', form.form);
  const emailCode = useField('emailCode', form.form);
  const description = useField('description', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <div className={groupErrClass(screenName)}>
        <label htmlFor="screenname-input">Display name</label>
        <input
          id="screenname-input"
          className="form-control narrow-input"
          type="text"
          autoComplete="name"
          {...screenName.input}
        />
        {errorMessage(screenName)}
      </div>

      <div className={groupErrClass(email)}>
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          className="form-control wider-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          {...email.input}
        />
        {errorMessage(email)}
      </div>

      <EmailVerificationSubform emailField={email} codeField={emailCode} />

      <div className={groupErrClass(description)}>
        <label htmlFor="description-input">About you</label>
        <textarea
          id="description-input"
          className={`form-control wider-input ${styles.profileDescription}`}
          maxLength={CONFIG.maxLength.description}
          {...description.input}
        />
      </div>

      <div className="form-group">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={formStatus.loading || !form.dirty || form.hasValidationErrors}
        >
          {formStatus.loading ? 'Updating profile…' : 'Update profile'}
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
          Profile updated
        </p>
      )}
    </form>
  );
}

function initialValues(userData) {
  return {
    screenName: userData.screenName || '',
    email: userData.email || '',
    emailCode: '',
    description: userData.description || '',
  };
}

function validate({ emailVerificationEnabled = false, initialEmail } = {}) {
  return (values) => {
    const errors = {};
    errors.screenName = shouldBe(
      /^.{3,25}$/i.test(values.screenName.trim()),
      <>
        {values.screenName.trim()} is not a valid display name.
        <br /> The length should be from 3 to 25 characters.
      </>,
    );
    errors.email = shouldBe(
      values.email.trim() === '' || isEmail(values.email.trim()),
      'Invalid email',
    );

    if (emailVerificationEnabled && values.email.trim() !== initialEmail.trim()) {
      errors.emailCode = shouldBe(values.emailCode.replace(/\W+/g, '').length >= 6, 'Invalid code');
    }

    return errors;
  };
}

function onSubmit(id, dispatch) {
  return (values) => {
    dispatch(
      updateUser({
        id,
        screenName: values.screenName.trim(),
        email: values.email.trim(),
        emailVerificationCode: values.emailCode,
        description: values.description.trim(),
      }),
    );
  };
}
