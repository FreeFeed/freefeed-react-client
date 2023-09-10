import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import Feed from './feed';
import PaginatedView from './paginated-view';
import { joinPostData, postActions } from './select-utils';

export default function BacklinksFeed(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isLoading = useSelector((state) => state.routeLoadingState);
  const entries = useSelector((state) => state.feedViewState.entries.map(joinPostData(state)));
  const postLink = useMemo(
    () => `/${props.params.userName}/${props.params.postId}`,
    [props.params.postId, props.params.userName],
  );
  const feedProps = useMemo(() => postActions(dispatch), [dispatch]);

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        References to <Link to={postLink}>{postLink}</Link>
      </div>
      {!isLoading &&
        (entries.length > 0 ? (
          <PaginatedView {...props}>
            <Feed user={user} {...feedProps} />
          </PaginatedView>
        ) : (
          <div className="box-body">
            <p>No references found.</p>
          </div>
        ))}
      <div className="box-footer" />
    </div>
  );
}
