import { Link } from 'react-router';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { faComment, faEdit } from '@fortawesome/free-regular-svg-icons';
import { useSelector } from 'react-redux';
import { deleteDraft, getAllDrafts, subscribeToDraftChanges } from '../services/drafts';
import { pluralForm } from '../utils';
import { postReadmoreConfig } from '../utils/readmore-config';
import { READMORE_STYLE_COMPACT } from '../utils/frontend-preferences-options';
import ErrorBoundary from './error-boundary';
import TimeDisplay from './time-display';
import PieceOfText from './piece-of-text';
import { Icon } from './fontawesome-icons';
import { useBool } from './hooks/bool';
import { UserPicture } from './user-picture';
import { faCommentPlus } from './fontawesome-custom-icons';
import Expandable from './expandable';

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
  const user = useSelector((state) => state.user);
  const readMoreStyle = useSelector((state) => state.user.frontendPreferences.readMoreStyle);

  const [type, uri] = draftKey.split(':');
  const typeTitle = useMemo(() => {
    switch (type) {
      case 'new-post':
        if (uri === '/') {
          return 'creating a new post at Home';
        } else if (uri === '/filter/discussions') {
          return 'creating a new post in Discussions';
        } else if (uri === `/${user.username}`) {
          return 'creating a new post in your feed';
        } else if (uri.startsWith('/filter/direct')) {
          let newPostPlace = 'creating a direct message';
          if (data.feeds) {
            newPostPlace += ` to ${data.feeds.join(', ')}`;
          } else if (uri.includes('?to=')) {
            newPostPlace += ` to ${uri.slice('/filter/direct?to='.length)}`;
          }
          return newPostPlace;
        } else if (data.feeds) {
          return `creating a new post to ${data.feeds.join(', ')}`;
        }
        return `creating a new post at ${uri}`;
      case 'new-comment': {
        return 'creating a new comment';
      }
      case 'post': {
        return 'editing a post';
      }
      case 'comment': {
        return 'editing a comment';
      }
      default:
        type;
    }
  }, [data.feeds, type, uri, user.username]);

  const commentIcon = type === 'comment' ? faComment : faCommentPlus;

  const isPost = type.includes('post');

  const onDelete = useCallback(() => {
    if (!confirm('Discard unsaved changes?')) {
      return;
    }

    deleteDraft(draftKey);
  }, [draftKey]);

  const [absTimestamps, toggleAbsTimestamps] = useBool(false);

  return (
    <div className="single-event">
      <div className="single-event__picture">
        {isPost ? (
          <UserPicture user={user} size={40} loading="lazy" />
        ) : (
          <Icon className="single-event__picture-icon" icon={commentIcon} />
        )}
      </div>
      <div className="single-event__headline">
        <Link to={uri}>You&#x2019;re {typeTitle}</Link>
        {data.files?.length > 0 && <em> with {pluralForm(data.files.length, 'file')}</em>}
        <button className="btn btn-default btn-xs pull-right" type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
      <div className="single-event__content">
        {data.text ? (
          <Expandable
            expanded={readMoreStyle === READMORE_STYLE_COMPACT}
            config={postReadmoreConfig}
          >
            <PieceOfText text={data.text} readMoreStyle={readMoreStyle} />
          </Expandable>
        ) : (
          <em className="text-muted">no text</em>
        )}
      </div>
      <div className="single-event__date">
        <Icon icon={faEdit} className="single-event__date-icon" onClick={toggleAbsTimestamps} />
        <Link to={uri}>
          <TimeDisplay timeStamp={data.ts} absolute={absTimestamps || null} />
        </Link>
      </div>
    </div>
  );
}
