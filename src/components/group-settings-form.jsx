/* global CONFIG */
import { useMemo } from 'react';
import { useField, useForm } from 'react-final-form-hooks';
import { useSelector, useDispatch } from 'react-redux';
import { find } from 'lodash-es';

import { disableBansInGroup, enableBansInGroup, updateGroup } from '../redux/action-creators';
import { doSequence, initialAsyncState } from '../redux/async-helpers';
import { PreventPageLeaving } from './prevent-page-leaving';
import { Throbber } from './throbber';
import { privacyFlagsToString, privacyStringToFlags } from './settings/forms/privacy';
import { shouldBe, errorMessage, groupErrClass, RadioInput, CheckboxInput } from './form-utils';
import styles from './settings/forms/forms.module.scss';
import settingsStyles from './settings/settings.module.scss';

const PUBLIC = 'public',
  PROTECTED = 'protected',
  PRIVATE = 'private';

export default function GroupSettingsForm({ username }) {
  const dispatch = useDispatch();
  const group = useSelector((state) => find(state.users, { username }));
  const formStatus = useSelector(
    (state) => state.updateGroupStatuses[group.id] || initialAsyncState,
  );

  const form = useForm(
    useMemo(
      () => ({
        validate,
        initialValues: initialValues(group),
        onSubmit: onSubmit(group, dispatch),
      }),
      [dispatch, group],
    ),
  );

  const screenName = useField('screenName', form.form);
  const description = useField('description', form.form);
  const privacy = useField('privacy', form.form);
  const restrictness = useField('restrictness', form.form);
  const showBanned = useField('showBanned', form.form);

  const showPrivacyWarning = useMemo(
    () => privacy.input.value !== PRIVATE && group.isPrivate === '1',
    [group.isPrivate, privacy.input.value],
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <section className={settingsStyles.formSection}>
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

        <div className={groupErrClass(description)}>
          <label htmlFor="description-input">Description</label>
          <textarea
            id="description-input"
            className={`form-control wider-input ${styles.profileDescription}`}
            maxLength={CONFIG.maxLength.description}
            {...description.input}
          />
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <div className="form-group">
          <p>
            <strong>Who can view posts?</strong>
          </p>
          <div className="radio">
            <label>
              <RadioInput field={privacy} value={PUBLIC} />
              Everyone (public group)
            </label>
          </div>
          <div className="radio">
            <label>
              <RadioInput field={privacy} value={PROTECTED} />
              {CONFIG.siteTitle} users only (protected group)
            </label>
          </div>
          <div className="radio">
            <label>
              <RadioInput field={privacy} value={PRIVATE} />
              Group members only (private group)
            </label>
          </div>
          {showPrivacyWarning && (
            <div className="alert alert-warning" role="alert">
              You are about to change the group type from private to{' '}
              {privacy.input.value === PROTECTED ? 'protected' : 'public'}. It means{' '}
              {privacy.input.value === PROTECTED ? `any ${CONFIG.siteTitle} user` : 'anyone'} will
              be able to will be able to read its posts and comments, which are only available to
              group members now.
            </div>
          )}
        </div>

        <div className="form-group">
          <p>
            <strong>Who can write posts?</strong>
          </p>
          <div className="radio">
            <label>
              <RadioInput field={restrictness} value="0" />
              Every group member
            </label>
          </div>
          <div className="radio">
            <label>
              <RadioInput field={restrictness} value="1" />
              Group administrators only
            </label>
          </div>
        </div>

        <div className="form-group">
          <p>
            <strong>Blocked content</strong>
          </p>
          <div className="checkbox">
            <label>
              <CheckboxInput field={showBanned} />
              Show posts from users you have blocked and who have blocked you
            </label>
            <span className="help-block">
              This setting works only for you, not for the other members of the group.
            </span>
          </div>
        </div>
      </section>

      <div className="form-group">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={formStatus.loading || !form.dirty || form.hasValidationErrors}
        >
          {formStatus.loading ? 'Updating group…' : 'Update group'}
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
          Group updated
        </p>
      )}
    </form>
  );
}

function initialValues(group) {
  return {
    screenName: group.screenName || '',
    description: group.description || '',
    privacy: privacyFlagsToString(group),
    restrictness: group.isRestricted,
    showBanned: group.youCan.includes('undisable_bans'),
  };
}

function validate(values) {
  const errors = {};
  errors.screenName = shouldBe(
    /^.{3,25}$/i.test(values.screenName.trim()),
    <>
      {values.screenName.trim()} is not a valid display name.
      <br /> The length should be from 3 to 25 characters.
    </>,
  );
  return errors;
}

function onSubmit(group, dispatch) {
  return (values) => {
    const updateBans = values.showBanned ? disableBansInGroup : enableBansInGroup;

    doSequence(dispatch)(
      (dispatch) =>
        dispatch(
          updateGroup(group.id, {
            screenName: values.screenName.trim(),
            description: values.description.trim(),
            ...privacyStringToFlags(values.privacy),
            isRestricted: values.restrictness,
          }),
        ),
      (dispatch) => dispatch(updateBans(group.username)),
    );
  };
}
