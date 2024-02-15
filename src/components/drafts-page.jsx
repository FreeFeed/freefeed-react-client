import { Link } from 'react-router';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { deleteDraft, getAllDrafts, subscribeToDraftChanges } from '../services/drafts';
import { pluralForm } from '../utils';
import ErrorBoundary from './error-boundary';
import TimeDisplay from './time-display';

export default function DraftsPage() {
  const allDrafts = useSyncExternalStore(subscribeToDraftChanges, getAllDrafts);

  return (
    <div className="box notifications">
      <ErrorBoundary>
        <div className="box-header-timeline" role="heading">
          Drafts
        </div>
        <div className="box-body">
          <div style={{ marginBottom: '2em' }}>
            <p>
              This page contains unsaved drafts of posts and comments. Follow the links to finish
              editing and posting them.
            </p>
            <p>
              Keep in mind that unsaved drafts are stored locally in your browser and are not
              accessible from your other devices. Drafts are kept for 7 days and are deleted when
              you log out.
            </p>
          </div>
          {allDrafts.length === 0 && <p>You have no drafts for now.</p>}
          {allDrafts.map(([key, data]) => (
            <DraftEntry key={key} draftKey={key} data={data} />
          ))}
        </div>
      </ErrorBoundary>
    </div>
  );
}

function DraftEntry({ draftKey, data }) {
  const [type, uri] = draftKey.split(':');
  const typeTitle = useMemo(() => {
    switch (type) {
      case 'new-post':
        return 'New post';
      case 'new-comment':
        return 'New comment';
      case 'post':
        return 'Editing post';
      case 'comment':
        return 'Editing comment';
      default:
        type;
    }
  }, [type]);

  const onDelete = useCallback(() => {
    if (!confirm('Discard unsaved changes?')) {
      return;
    }

    deleteDraft(draftKey);
  }, [draftKey]);

  return (
    <div>
      <p>
        <Link to={uri}>
          {typeTitle} <TimeDisplay timeStamp={data.ts} inline />
        </Link>
        <button className="btn btn-default btn-sm pull-right" type="button" onClick={onDelete}>
          Delete
        </button>
      </p>
      <blockquote>
        {data.text || <em className="text-muted">no text</em>}
        {data.files?.length > 0 && <footer>and {pluralForm(data.files.length, 'file')}</footer>}
      </blockquote>
      <hr />
    </div>
  );
}
