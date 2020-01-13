import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useField } from 'react-final-form-hooks';
import { without, uniq } from 'lodash';
import {
  DISPLAYNAMES_DISPLAYNAME,
  DISPLAYNAMES_BOTH,
  DISPLAYNAMES_USERNAME,
  READMORE_STYLE_COMPACT,
  READMORE_STYLE_COMFORT,
  COMMENT_HIDDEN_BANNED,
} from '../../../utils/frontend-preferences-options';
import {
  HOMEFEED_MODE_FRIENDS_ONLY,
  HOMEFEED_MODE_CLASSIC,
  HOMEFEED_MODE_FRIENDS_ALL_ACTIVITY,
} from '../../../utils/feed-options';
import { Throbber } from '../../throbber';
import { updateActualUserPreferences } from '../../../redux/action-creators';
import settingsStyles from '../settings.module.scss';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { RadioInput, CheckboxInput } from './utils';
import styles from './forms.module.scss';

export default function AppearanceForm() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const formStatus = useSelector((state) => state.settingsForms.displayPrefsStatus);

  const form = useForm(
    useMemo(
      () => ({
        initialValues: initialValues(userData),
        onSubmit: onSubmit(dispatch),
      }),
      [dispatch, userData],
    ),
  );

  const useYou = useField('useYou', form.form);
  const displayNames = useField('displayNames', form.form);
  const homeFeedMode = useField('homeFeedMode', form.form);
  const hiddenUsers = useField('hiddenUsers', form.form);
  const readmoreStyle = useField('readmoreStyle', form.form);
  const omitBubbles = useField('omitBubbles', form.form);
  const highlightComments = useField('highlightComments', form.form);
  const hideBannedComments = useField('hideBannedComments', form.form);
  const hideUnreadNotifications = useField('hideUnreadNotifications', form.form);
  const allowLinksPreview = useField('allowLinksPreview', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <section className={settingsStyles.formSection}>
        <h4>Names</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={useYou} />
              Show your own name as &quot;You&quot;
            </label>
          </div>
        </div>

        <div className="form-group">
          <p>Show other users as:</p>

          <div className="radio">
            <label>
              <RadioInput field={displayNames} value={DISPLAYNAMES_DISPLAYNAME.toString()} />
              Display name only
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={displayNames} value={DISPLAYNAMES_BOTH.toString()} />
              Display name + username
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={displayNames} value={DISPLAYNAMES_USERNAME.toString()} />
              Username only
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4>Your Home feed content</h4>

        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={homeFeedMode} value={HOMEFEED_MODE_FRIENDS_ONLY} />
              Posts written by your friends or posted to groups you are subscribed to
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={homeFeedMode} value={HOMEFEED_MODE_CLASSIC} />
              Also posts liked/commented on by your friends <em>(default setting)</em>
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={homeFeedMode} value={HOMEFEED_MODE_FRIENDS_ALL_ACTIVITY} />
              Also your friends&#x2019; activity in groups you are not subscribed to
            </label>
          </div>

          <div className="form-group">
            Hide posts from these users and groups in your Home feed:
            <br />
            <textarea
              className={`form-control wider-input ${styles.hiddenUsers}`}
              name="hiddenUsers"
              {...hiddenUsers.input}
            />
            <p className="help-block">Comma-separated list of usernames and group names</p>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4>Display density</h4>

        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={readmoreStyle} value={READMORE_STYLE_COMPACT} />
              Compact: hides line breaks (until &quot;Expand&quot; is clicked)
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={readmoreStyle} value={READMORE_STYLE_COMFORT} />
              Comfortable: displays line breaks, shows &quot;Read more&quot; for longer posts and
              comments
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4>Comments</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={omitBubbles} />
              Omit bubbles for subsequent comments from the same author
            </label>
          </div>

          <div className="checkbox">
            <label>
              <CheckboxInput field={highlightComments} />
              Highlight comments when hovering on @username or ^ and ↑
            </label>
          </div>

          <div className="checkbox">
            <label>
              <CheckboxInput field={hideBannedComments} />
              Hide comments from blocked users (don&#x2019;t show placeholder)
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4>Unread notifications</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={hideUnreadNotifications} />
              Hide unread notification counter
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4>Link previews</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={allowLinksPreview} />
              Show advanced previews of links in posts (using Embedly)
              <p className="help-block">
                Link should start with http(s)://, post should have no attached files. If you
                don&#x2019;t want to have link preview, add ! before a link without spaces.
              </p>
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
          {formStatus.loading ? 'Updating appearance…' : 'Update appearance'}
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
          Appearance updated
        </p>
      )}
    </form>
  );
}

function initialValues({ frontendPreferences: frontend, preferences: backend }) {
  return {
    useYou: frontend.displayNames.useYou,
    displayNames: frontend.displayNames.displayOption.toString(),
    homeFeedMode: frontend.homeFeedMode,
    hiddenUsers: frontend.homefeed.hideUsers.join(', '),
    readmoreStyle: frontend.readMoreStyle,
    omitBubbles: frontend.comments.omitRepeatedBubbles,
    highlightComments: frontend.comments.highlightComments,
    hideBannedComments: backend.hideCommentsOfTypes.includes(COMMENT_HIDDEN_BANNED),
    hideUnreadNotifications: frontend.hideUnreadNotifications,
    allowLinksPreview: frontend.allowLinksPreview,
  };
}

function onSubmit(dispatch) {
  return (values) => {
    dispatch(
      updateActualUserPreferences({
        updateFrontendPrefs() {
          return {
            displayNames: {
              useYou: values.useYou,
              displayOption: parseInt(values.displayNames, 10),
            },
            homeFeedMode: values.homeFeedMode,
            homefeed: {
              hideUsers: values.hiddenUsers.toLowerCase().match(/[\w-]+/g) || [],
            },
            readMoreStyle: values.readMoreStyle,
            comments: {
              omitRepeatedBubbles: values.omitBubbles,
              highlightComments: values.highlightComments,
            },
            hideUnreadNotifications: values.hideUnreadNotifications,
            allowLinksPreview: values.allowLinksPreview,
          };
        },

        updateBackendPrefs({ hideCommentsOfTypes }) {
          return {
            hideCommentsOfTypes: values.hideBannedComments
              ? uniq([...hideCommentsOfTypes, COMMENT_HIDDEN_BANNED])
              : without(hideCommentsOfTypes, COMMENT_HIDDEN_BANNED),
          };
        },
      }),
    );
  };
}
