import { connect } from 'react-redux';
import {
  doClaimSearch,
  doResolveUris,
  doResolvedSearch,
  doUpdateSearchQuery,
  makeSelectResolvedSearchResults,
  makeSelectResolvedSearchResultsLastPageReached,
  makeSelectSearchUris,
  selectClaimSearchByQuery,
  selectIsSearching,
  selectResolvingUris,
  selectSearchValue,
  makeSelectQueryWithOptions,
} from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import SearchPage from './view';

const select = state => ({
  claimSearchByQuery: selectClaimSearchByQuery(state),
  currentRoute: selectCurrentRoute(state),
  isSearching: selectIsSearching(state),
  query: selectSearchValue(state),
  resolvingUris: selectResolvingUris(state),
  uris: makeSelectSearchUris(makeSelectQueryWithOptions(null, Constants.SEARCH_RESULTS_PAGE_SIZE)(state))(state),
  results: makeSelectResolvedSearchResults(makeSelectQueryWithOptions(null, Constants.SEARCH_RESULTS_PAGE_SIZE)(state))(
    state,
  ),
  lastPageReached: makeSelectResolvedSearchResultsLastPageReached(
    makeSelectQueryWithOptions(null, Constants.SEARCH_RESULTS_PAGE_SIZE)(state),
  )(state),
});

const perform = dispatch => ({
  search: (query, from) => dispatch(doResolvedSearch(query, Constants.SEARCH_RESULTS_PAGE_SIZE, from, false, {})),
  claimSearch: options => dispatch(doClaimSearch(options)),
  updateSearchQuery: query => dispatch(doUpdateSearchQuery(query)),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_SEARCH)),
  resolveUris: uris => dispatch(doResolveUris(uris)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform,
)(SearchPage);
