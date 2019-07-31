import { connect } from 'react-redux';
import {
  MATURE_TAGS,
  doClaimSearch,
  selectClaimSearchByQuery,
  selectFetchingClaimSearchByQuery,
  selectFetchingClaimSearch,
} from 'lbry-redux';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import ClaimList from './view';

const select = (state, props) => {
  return {
    // loadingByQuery: selectFetchingClaimSearchByQuery(state),
    claimSearchByQuery: selectClaimSearchByQuery(state),
    // for subscriptions
    loading: selectFetchingClaimSearch(state),
    // claimSearchUris: selectLastClaimSearchUris(state),
  };
};

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(options)),
});

export default connect(
  select,
  perform
)(ClaimList);
