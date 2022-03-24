import { faClock } from '@fortawesome/free-regular-svg-icons';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';

import { getAttachmentsStats, sanitizeMedia } from '../../redux/action-creators';
import { pluralForm } from '../../utils';
import { Icon } from '../fontawesome-icons';
import TimeDisplay from '../time-display';
import { SettingsPage } from './layout';
import styles from './settings.module.scss';

export default function SanitizeMediaPage() {
  const dispatch = useDispatch();
  const attStatsStatus = useSelector((state) => state.attachmentsStatsStatus);
  const attStats = useSelector((state) => state.attachmentsStats);

  useEffect(
    () => void (attStatsStatus.initial && dispatch(getAttachmentsStats())),
    [attStatsStatus, dispatch],
  );

  return (
    <SettingsPage title="Sanitize media files">
      {attStatsStatus.success ? (
        <SuccessContent attStats={attStats} />
      ) : attStatsStatus.error ? (
        <section className={styles.formSection}>
          <p>Error loading data: {attStatsStatus.errorText}</p>
        </section>
      ) : (
        <section className={styles.formSection}>
          <p>Loading data&hellip;</p>
        </section>
      )}
    </SettingsPage>
  );
}

function SuccessContent({ attStats }) {
  const {
    preferences: { sanitizeMediaMetadata },
  } = useSelector((state) => state.user);

  const { total, sanitized } = attStats.attachments;
  const toProcess = total - sanitized;

  return (
    <>
      <section className={styles.formSection}>
        <p>
          Images and other media might contain sensitive metadata such as geographical coordinates
          of the place where they were taken, serial number of lens/camera and even your name. We do
          our best to remove this data automatically, in case you don&#x2019;t want to make it
          public.
        </p>
        {sanitizeMediaMetadata ? (
          <p>
            New files that you upload are sanitized automatically
            {toProcess > 0 ? (
              <>
                , but you have <strong>{toProcess}</strong>{' '}
                {pluralForm(toProcess, 'older file', null, 'w')} which still might contain this
                info.
              </>
            ) : (
              '.'
            )}
          </p>
        ) : (
          <p>
            New files that you upload are <strong>not</strong> sanitized automatically. You can
            change this at the <Link to="/settings/privacy#files">Privacy</Link> page.
            {toProcess > 0 && (
              <>
                {' '}
                You also have <strong>{toProcess}</strong>{' '}
                {pluralForm(toProcess, 'file', null, 'w')} which might contain this info.
              </>
            )}
          </p>
        )}
      </section>
      {(attStats.sanitizeTask || total > 0) && (
        <section className={styles.formSection}>
          {attStats.sanitizeTask || toProcess > 0 ? (
            <SanitizeTask task={attStats.sanitizeTask} />
          ) : (
            <p>All your files are sanitized. You don&#x2019;t need to take any action now.</p>
          )}
        </section>
      )}
    </>
  );
}

function SanitizeTask({ task }) {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.sanitizeMediaStatus);

  const submit = useCallback(() => dispatch(sanitizeMedia()), [dispatch]);

  if (task) {
    return (
      <p>
        <Icon icon={faClock} /> The sanitization process was started at{' '}
        <TimeDisplay timeStamp={task?.createdAt || 0} absolute />. It may take some time to
        complete.
      </p>
    );
  }

  return (
    <>
      <p>
        <button className="btn btn-primary" onClick={submit} disabled={status.loading}>
          Remove Sensitive Data
        </button>{' '}
        (it might take some time)
      </p>
      {status.loading && <p>Sending request&hellip;</p>}
      {status.error && <p>Error sending request: {status.errorText}</p>}
    </>
  );
}
