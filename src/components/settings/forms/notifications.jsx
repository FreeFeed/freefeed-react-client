import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useForm, useField } from 'react-final-form-hooks';
import { pick } from 'lodash';
import { Throbber } from '../../throbber';
import { updateUserNotificationPreferences } from '../../../redux/action-creators';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { CheckboxInput } from '../../form-utils';

export default function NotificationsForm() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const formStatus = useSelector((state) => state.settingsForms.notificationsStatus);

  const form = useForm(
    useMemo(
      () => ({
        initialValues: initialValues(userData),
        onSubmit: onSubmit(userData, dispatch),
      }),
      [dispatch, userData],
    ),
  );

  const sendNotificationsDigest = useField('sendNotificationsDigest', form.form);
  const sendDailyBestOfDigest = useField('sendDailyBestOfDigest', form.form);
  const sendWeeklyBestOfDigest = useField('sendWeeklyBestOfDigest', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <p>Email me:</p>

      <div className="form-group">
        <div className="checkbox">
          <label>
            <CheckboxInput field={sendNotificationsDigest} />
            Daily unread notifications
          </label>
        </div>

        <div className="checkbox">
          <label>
            <CheckboxInput field={sendDailyBestOfDigest} />
            Daily <Link to="/summary/1">Best of Day</Link> digest
          </label>
        </div>

        <div className="checkbox">
          <label>
            <CheckboxInput field={sendWeeklyBestOfDigest} />
            Weekly <Link to="/summary/7">Best of Week</Link> digest
          </label>
        </div>
      </div>

      <div className="form-group">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={formStatus.loading || !form.dirty || form.hasValidationErrors}
        >
          {formStatus.loading
            ? 'Updating notification preferences…'
            : 'Update notification preferences'}
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
          Notification preferences updated
        </p>
      )}
    </form>
  );
}

function initialValues({ preferences }) {
  return pick(preferences, [
    'sendNotificationsDigest',
    'sendDailyBestOfDigest',
    'sendWeeklyBestOfDigest',
  ]);
}

function onSubmit(userData, dispatch) {
  return (values) => dispatch(updateUserNotificationPreferences(userData.id, values));
}
