import { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { useNouter } from '../services/nouter';
import { joinPostData, postActions } from './select-utils';
import Feed from './feed';
import PaginatedView from './paginated-view';
import { lazyComponent } from './lazy-component';
import { useSearchQuery } from './hooks/search-query';
import { useBool } from './hooks/bool';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';
import { SignInLink } from './sign-in-link';
import { SearchAccountsResults } from './search-acconts-results';

const AdvancedSearchForm = lazyComponent(
  () =>
    import('./advanced-search-form/advanced-search-form').then((m) => ({
      default: m.AdvancedSearchForm,
    })),
  {
    fallback: <div>Loading form...</div>,
    errorMessage: "Couldn't load search form",
  },
);

function FeedHandler(props) {
  const {
    location: { query: urlQuery },
  } = useNouter();
  const queryString = useSearchQuery();
  const preopenAdvancedForm = !queryString || 'advanced' in urlQuery;

  const pageIsLoading = useSelector((state) => state.routeLoadingState);
  const [advFormVisible, setAdvFormVisible] = useBool(preopenAdvancedForm);
  const authenticated = useSelector((state) => state.authenticated);

  useEffect(() => {
    if (pageIsLoading) {
      setAdvFormVisible(false);
    } else {
      setAdvFormVisible(preopenAdvancedForm);
    }
  }, [pageIsLoading, preopenAdvancedForm, setAdvFormVisible]);

  if (!authenticated) {
    return (
      <div className="box">
        <div className="box-header-timeline" role="heading">
          Search
        </div>
        <div className="box-body" style={{ marginTop: '1em' }}>
          <p>
            Please <SignInLink>Sign In</SignInLink> to use the search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        {props.boxHeader}
      </div>
      <div className="box-body" style={{ marginTop: '1em' }}>
        {queryString && (
          <>
            <p>
              {pageIsLoading ? 'Searching' : 'Search results'} for: <strong>{queryString}</strong>
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
        {(!queryString || advFormVisible) && <AdvancedSearchForm />}
        {props.entries.length > 0 && <hr />}
      </div>
      <SearchAccountsResults />
      {props.entries.length > 0 && (
        <PaginatedView
          {...props}
          firstPageHead={
            <h4 className="user-subheader" style={{ marginBottom: 0 }}>
              Found posts
            </h4>
          }
        >
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
