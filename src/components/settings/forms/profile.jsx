/* global CONFIG */
import { useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useSelector, useDispatch } from 'react-redux';
import isEmail from 'validator/lib/isEmail';

import { Throbber } from '../../throbber';
import { updateUser } from '../../../redux/action-creators';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { shouldBe, errorMessage, groupErrClass } from '../../form-utils';
import styles from './forms.module.scss';

export default function ProfileForm() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const formStatus = useSelector((state) => state.settingsForms.updateProfileStatus);

  const form = useForm(
    useMemo(
      () => ({
        validate,
        initialValues: initialValues(userData),
        onSubmit: onSubmit(userData.id, dispatch),
      }),
      [dispatch, userData],
    ),
  );

  const screenName = useField('screenName', form.form);
  const email = useField('email', form.form);
  const description = useField('description', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <div className={groupErrClass(screenName)}>
        <label htmlFor="screenname-input">Display name</label>
        <input
          id="screenname-input"
          className="form-control wider-input"
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
          className="form-control narrow-input"
          type="email"
          autoComplete="email"
          inputMode="email"
          {...email.input}
        />
        {errorMessage(email)}
      </div>

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
    description: userData.description || '',
  };
}

function validate(values) {
  const errors = {};
  errors.screenName = shouldBe(
    /^.{3,25}$/i.test(values.screenName.trim()),
    <>
      {values.screenName.trim()} is not a valid displayname.
      <br /> The length should be from 3 to 25 characters.
    </>,
  );
  errors.email = shouldBe(
    values.email.trim() === '' || isEmail(values.email.trim()),
    'Invalid email',
  );
  return errors;
}

function onSubmit(id, dispatch) {
  return (values) => {
    dispatch(
      updateUser(
        id,
        values.screenName.trim(),
        values.email.trim(),
        undefined,
        undefined,
        values.description.trim(), // frontendPreferences should not updates
      ),
    );
  };
}
