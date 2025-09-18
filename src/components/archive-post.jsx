import { connect } from 'react-redux';
import { useNouter } from '../services/nouter';

function ArchivePostHandler({ inProgress, success, id }) {
  const { location, navigate } = useNouter();
  if (success) {
    navigate(`/archive/${encodeURIComponent(id)}`, { replace: true });
    return null;
  }

  let postBody;

  if (inProgress) {
    postBody = (
      <p>
        Loading info for <strong>{location.query.url}</strong>...
      </p>
    );
  } else {
    postBody = (
      <div>
        <p>
          It seems that post <strong>{location.query.url}</strong> has not yet been restored from
          the archive.
        </p>
        <p>
          You can try to find{' '}
          <a
            target="_blank"
            style={{ textDecoration: 'underline' }}
            href={`https://web.archive.org/web/20150410000000/${encodeURIComponent(
              location.query.url,
            )}`}
            rel="noreferrer"
          >
            copy of this post on archive.org
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        Friendfeed Post
      </div>
      <div className="box-body">{postBody}</div>
      <div className="box-footer" />
    </div>
  );
}

function selectState(state) {
  const { archivePost } = state;
  return archivePost;
}

export default connect(selectState)(ArchivePostHandler);
