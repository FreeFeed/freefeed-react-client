import { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { joinPostData, postActions } from './select-utils';
import Feed from './feed';
import PaginatedView from './paginated-view';
import { lazyComponent } from './lazy-component';
import { useSearchQuery } from './hooks/search-query';
import { useBool } from './hooks/bool';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';

const SearchFormAdvanced = lazyComponent(
  () => import('./search-form-advanced').then((m) => ({ default: m.SearchFormAdvanced })),
  {
    fallback: <div>Loading form...</div>,
    errorMessage: "Couldn't load search form",
  },
);

function FeedHandler(props) {
  const queryString = useSearchQuery();
  const pageIsLoading = useSelector((state) => state.routeLoadingState);
  const [advFormVisible, setAdvFormVisible] = useBool(!queryString);

  useEffect(() => void (pageIsLoading && setAdvFormVisible(false)), [
    pageIsLoading,
    setAdvFormVisible,
  ]);

  return (
    <div className="box">
      <div className="box-header-timeline">{props.boxHeader}</div>
      <div className="box-body" style={{ marginTop: '1em' }}>
        {queryString && (
          <>
            <p>
              {pageIsLoading ? 'Searching' : 'Seach results'} for: <strong>{queryString}</strong>
            </p>
            {props.entries.length === 0 && !pageIsLoading && (
              <p>No results found. Try a different query.</p>
            )}
            <p>
              <ButtonLink onClick={setAdvFormVisible}>
                <Icon icon={advFormVisible ? faChevronDown : faChevronRight} /> Advanced search
                options
              </ButtonLink>
            </p>
          </>
        )}
        {(!queryString || advFormVisible) && <SearchFormAdvanced />}
        {props.entries.length > 0 && <hr />}
      </div>
      {props.entries.length > 0 && (
        <PaginatedView {...props}>
          <Feed {...props} />
        </PaginatedView>
      )}
      <div className="box-footer" />
    </div>
  );
}

function selectState(state) {
  const { authenticated, boxHeader, highlightTerms, timelines, user } = state;
  const entries = state.feedViewState.entries.map(joinPostData(state));

  return { user, authenticated, entries, timelines, boxHeader, highlightTerms };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(FeedHandler);
