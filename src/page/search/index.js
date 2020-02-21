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
import { selectShowNsfw } from 'redux/selectors/settings';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import SearchPage from './view';

const select = state => ({
  claimSearchByQuery: selectClaimSearchByQuery(state),
  currentRoute: selectCurrentRoute(state),
  isSearching: selectIsSearching(state),
  query: selectSearchValue(state),
  resolvingUris: selectResolvingUris(state),
  showNsfwContent: selectShowNsfw(state),
  uris: makeSelectSearchUris(
    makeSelectQueryWithOptions(null, { size: Constants.DEFAULT_PAGE_SIZE, isBackgroundSearch: false })(state),
  )(state),
  results: makeSelectResolvedSearchResults(
    makeSelectQueryWithOptions(null, { size: Constants.DEFAULT_PAGE_SIZE, isBackgroundSearch: false })(state),
  )(state),
  lastPageReached: makeSelectResolvedSearchResultsLastPageReached(
    makeSelectQueryWithOptions(null, { size: Constants.DEFAULT_PAGE_SIZE, isBackgroundSearch: false })(state),
  )(state),
});

const perform = dispatch => ({
  search: (query, from, nsfw) => dispatch(doResolvedSearch(query, Constants.DEFAULT_PAGE_SIZE, from, false, {}, nsfw)),
  claimSearch: options => dispatch(doClaimSearch(options)),
  updateSearchQuery: query => dispatch(doUpdateSearchQuery(query)),
  pushDrawerStack: (routeName, params) => dispatch(doPushDrawerStack(routeName, params)),
  resolveUris: uris => dispatch(doResolveUris(uris)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform,
)(SearchPage);
