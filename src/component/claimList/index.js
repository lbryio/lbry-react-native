import { connect } from 'react-redux';
import {
  MATURE_TAGS,
  doClaimSearch,
  selectClaimSearchByQuery,
  selectClaimSearchByQueryLastPageReached,
  selectFetchingClaimSearchByQuery,
  selectFetchingClaimSearch,
} from 'lbry-redux';
import { selectShowNsfw } from 'redux/selectors/settings';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import ClaimList from './view';

const select = state => ({
  claimSearchByQuery: selectClaimSearchByQuery(state),
  lastPageReached: selectClaimSearchByQueryLastPageReached(state),
  loadingByQuery: selectFetchingClaimSearchByQuery(state),
  loading: selectFetchingClaimSearch(state),
  showNsfwContent: selectShowNsfw(state),
});

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(options, 'https://api.lbry.tv/api/v1/proxy')),
});

export default connect(select, perform)(ClaimList);
