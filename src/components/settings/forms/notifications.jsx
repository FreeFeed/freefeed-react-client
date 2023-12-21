import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useForm, useField } from 'react-final-form-hooks';
import { Throbber } from '../../throbber';
import {
  updateActualUserPreferences,
  updateUserNotificationPreferences,
} from '../../../redux/action-creators';
import { doSequence } from '../../../redux/async-helpers';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { CheckboxInput } from '../../form-utils';
import settingsStyles from '../settings.module.scss';

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

  const hideUnreadNotifications = useField('hideUnreadNotifications', form.form);
  const sendNotificationsDigest = useField('sendNotificationsDigest', form.form);
  const sendDailyBestOfDigest = useField('sendDailyBestOfDigest', form.form);
  const sendWeeklyBestOfDigest = useField('sendWeeklyBestOfDigest', form.form);
  const notifyOfCommentsOnMyPosts = useField('notifyOfCommentsOnMyPosts', form.form);
  const notifyOfCommentsOnCommentedPosts = useField('notifyOfCommentsOnCommentedPosts', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <section className={settingsStyles.formSection}>
        <h4 id="notifications">Comments on my posts</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={notifyOfCommentsOnMyPosts} />
              Notify me about all new comments on my posts
            </label>
          </div>
          <div className="checkbox">
            <label>
              <CheckboxInput field={notifyOfCommentsOnCommentedPosts} />
              Notify me about all new comments on posts I comment on
            </label>
          </div>
          <p className="help-block">
            You will still be able to turn off notifications for a specific post using the More
            menu.
          </p>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="notifications">Unread notifications</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={hideUnreadNotifications} />
              Hide unread notification counter in the sidebar
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="email-me">Email me:</h4>

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
      </section>

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

function initialValues({ frontendPreferences, preferences }) {
  return {
    hideUnreadNotifications: frontendPreferences.hideUnreadNotifications,
    sendNotificationsDigest: preferences.sendNotificationsDigest,
    sendDailyBestOfDigest: preferences.sendDailyBestOfDigest,
    sendWeeklyBestOfDigest: preferences.sendWeeklyBestOfDigest,
    notifyOfCommentsOnMyPosts: preferences.notifyOfCommentsOnMyPosts,
    notifyOfCommentsOnCommentedPosts: preferences.notifyOfCommentsOnCommentedPosts,
  };
}

function onSubmit(userData, dispatch) {
  return ({
    hideUnreadNotifications,
    sendNotificationsDigest,
    sendDailyBestOfDigest,
    sendWeeklyBestOfDigest,
    notifyOfCommentsOnMyPosts,
    notifyOfCommentsOnCommentedPosts,
  }) =>
    doSequence(dispatch)(
      (dispatch) =>
        dispatch(
          updateActualUserPreferences({
            updateFrontendPrefs: () => ({
              hideUnreadNotifications,
            }),
          }),
        ),
      (dispatch) => {
        dispatch(
          updateUserNotificationPreferences(userData.id, {
            sendNotificationsDigest,
            sendDailyBestOfDigest,
            sendWeeklyBestOfDigest,
            notifyOfCommentsOnMyPosts,
            notifyOfCommentsOnCommentedPosts,
          }),
        );
      },
    );
}
