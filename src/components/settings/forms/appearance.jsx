import React, { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useField } from 'react-final-form-hooks';
import { without, uniq } from 'lodash';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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
import { updateActualUserPreferences, setNSFWVisibility } from '../../../redux/action-creators';
import settingsStyles from '../settings.module.scss';
import { PreventPageLeaving } from '../../prevent-page-leaving';
import { Icon } from '../../fontawesome-icons';
import { RadioInput, CheckboxInput } from '../../form-utils';
import TimeDisplay from '../../time-display';
import styles from './forms.module.scss';

export default function AppearanceForm() {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user);
  const isNSFWVisible = useSelector((state) => state.isNSFWVisible);
  const formStatus = useSelector((state) => state.settingsForms.displayPrefsStatus);

  useEffect(() => {
    const { hash } = window.location;
    if (!hash) {
      return;
    }
    const element = document.getElementById(hash.substring(1));
    element && element.scrollIntoView();
  }, []);

  const form = useForm(
    useMemo(
      () => ({
        initialValues: initialValues({ ...userData, isNSFWVisible }),
        onSubmit: onSubmit(dispatch),
      }),
      [dispatch, isNSFWVisible, userData],
    ),
  );

  const useYou = useField('useYou', form.form);
  const displayNames = useField('displayNames', form.form);
  const homeFeedMode = useField('homeFeedMode', form.form);
  const hiddenUsers = useField('hiddenUsers', form.form);
  const readMoreStyle = useField('readMoreStyle', form.form);
  const omitBubbles = useField('omitBubbles', form.form);
  const highlightComments = useField('highlightComments', form.form);
  const hideBannedComments = useField('hideBannedComments', form.form);
  const hideUnreadNotifications = useField('hideUnreadNotifications', form.form);
  const allowLinksPreview = useField('allowLinksPreview', form.form);
  const hideNSFWContent = useField('hideNSFWContent', form.form);
  const commentsTimestamps = useField('commentsTimestamps', form.form);
  const timeAmPm = useField('timeAmPm', form.form);
  const timeAbsolute = useField('timeAbsolute', form.form);

  return (
    <form onSubmit={form.handleSubmit}>
      <PreventPageLeaving prevent={form.dirty} />

      <section className={settingsStyles.formSection}>
        <h4 id="names">Names</h4>

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
        <h4 id="home">Your Home feed content</h4>

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
        <h4 id="nsfw">NSFW content</h4>

        <div className="form-group">
          <div className="checkbox">
            <label>
              <CheckboxInput field={hideNSFWContent} />
              Hide NSFW content
            </label>
            <p className="help-block">
              <Icon icon={faExclamationTriangle} /> This setting is saved locally in your web
              browser. It can be different for each browser and each device that you use.
            </p>
            <p className="help-block">
              Hide images in posts marked with #nsfw tag (or posted to a group that has #nsfw in
              group description).
            </p>
            <p className="help-block">
              NSFW is an abbreviation of Not Safe For Work: images that the user may not wish to be
              seen looking at in a public, formal, or controlled environment, for example, nudity,
              or intense sexuality.
            </p>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="dencity">Display density</h4>

        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={readMoreStyle} value={READMORE_STYLE_COMPACT} />
              Compact: hides line breaks (until &quot;Expand&quot; is clicked)
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={readMoreStyle} value={READMORE_STYLE_COMFORT} />
              Comfortable: displays line breaks, shows &quot;Read more&quot; for longer posts and
              comments
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="comments">Comments</h4>

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

          <div className="checkbox">
            <label>
              <CheckboxInput field={commentsTimestamps} />
              Show timestamps for comments
            </label>
          </div>
        </div>
      </section>

      <section className={settingsStyles.formSection}>
        <h4 id="notifications">Unread notifications</h4>

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
        <h4 id="previews">Link previews</h4>

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

      <section className={settingsStyles.formSection}>
        <h4 id="time">Date and time</h4>
        <p>Display accuracy:</p>
        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={timeAbsolute} value={'0'} />
              Show relative time for the recent events (5 min ago, 3 hours ago, &hellip;)
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={timeAbsolute} value={'1'} />
              Always show absolute time (
              <TimeDisplay timeStamp={Date.now()} absolute amPm={timeAmPm.input.value === '1'} />)
            </label>
          </div>
        </div>
        <p>Time format:</p>
        <div className="form-group">
          <div className="radio">
            <label>
              <RadioInput field={timeAmPm} value={'0'} />
              24-hour time (16:20)
            </label>
          </div>

          <div className="radio">
            <label>
              <RadioInput field={timeAmPm} value={'1'} />
              12-hour time (4:20 p.m.)
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

function initialValues({ frontendPreferences: frontend, preferences: backend, isNSFWVisible }) {
  return {
    useYou: frontend.displayNames.useYou,
    displayNames: frontend.displayNames.displayOption.toString(),
    homeFeedMode: frontend.homeFeedMode,
    hiddenUsers: frontend.homefeed.hideUsers.join(', '),
    readMoreStyle: frontend.readMoreStyle,
    omitBubbles: frontend.comments.omitRepeatedBubbles,
    highlightComments: frontend.comments.highlightComments,
    hideBannedComments: backend.hideCommentsOfTypes.includes(COMMENT_HIDDEN_BANNED),
    hideUnreadNotifications: frontend.hideUnreadNotifications,
    allowLinksPreview: frontend.allowLinksPreview,
    hideNSFWContent: !isNSFWVisible,
    commentsTimestamps: frontend.comments.showTimestamps,
    timeAmPm: frontend.timeDisplay.amPm ? '1' : '0',
    timeAbsolute: frontend.timeDisplay.absolute ? '1' : '0',
  };
}

function onSubmit(dispatch) {
  return (values) => {
    dispatch(setNSFWVisibility(!values.hideNSFWContent));
    dispatch(
      updateActualUserPreferences({
        updateFrontendPrefs(prefs) {
          return {
            displayNames: {
              ...prefs.displayNames,
              useYou: values.useYou,
              displayOption: parseInt(values.displayNames, 10),
            },
            homeFeedMode: values.homeFeedMode,
            homefeed: {
              ...prefs.homefeed,
              hideUsers: values.hiddenUsers.toLowerCase().match(/[\w-]+/g) || [],
            },
            readMoreStyle: values.readMoreStyle,
            comments: {
              ...prefs.comments,
              omitRepeatedBubbles: values.omitBubbles,
              highlightComments: values.highlightComments,
              showTimestamps: values.commentsTimestamps,
            },
            hideUnreadNotifications: values.hideUnreadNotifications,
            allowLinksPreview: values.allowLinksPreview,
            timeDisplay: {
              ...prefs.timeDisplay,
              amPm: values.timeAmPm === '1',
              absolute: values.timeAbsolute === '1',
            },
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
