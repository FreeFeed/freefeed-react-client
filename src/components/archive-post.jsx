import { connect } from 'react-redux';

function ArchivePostHandler({ router, inProgress, success, id }) {
  if (success) {
    router.replace(`/archive/${encodeURIComponent(id)}`);
    return null;
  }

  let postBody = null;

  if (inProgress) {
    postBody = (
      <p>
        Loading info for <strong>{router.location.query.url}</strong>...
      </p>
    );
  } else {
    postBody = (
      <div>
        <p>
          It seems that post <strong>{router.location.query.url}</strong> has not yet been restored
          from the archive.
        </p>
        <p>
          You can try to find{' '}
          <a
            target="_blank"
            style={{ textDecoration: 'underline' }}
            href={`https://web.archive.org/web/20150410000000/${encodeURIComponent(
              router.location.query.url,
            )}`}
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
      <div className="box-header-timeline">Friendfeed Post</div>
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
