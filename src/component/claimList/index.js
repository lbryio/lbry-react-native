import { connect } from 'react-redux';
import {
  MATURE_TAGS,
  doClaimSearch,
  doClaimSearchByTags,
  makeSelectClaimSearchUrisForTags,
  makeSelectFetchingClaimSearchForTags,
  selectFetchingClaimSearch,
  selectLastClaimSearchUris,
} from 'lbry-redux';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import ClaimList from './view';

const select = (state, props) => {
  return {
    loading: makeSelectFetchingClaimSearchForTags(props.tags)(state),
    uris: makeSelectClaimSearchUrisForTags(props.tags)(state),
    // for subscriptions
    claimSearchLoading: selectFetchingClaimSearch(state),
    claimSearchUris: selectLastClaimSearchUris(state),
  };
};

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(Constants.DEFAULT_PAGE_SIZE, options)),
  searchByTags: (tags, orderBy = Constants.DEFAULT_ORDER_BY, page = 1) =>
    dispatch(
      doClaimSearchByTags(tags, Constants.DEFAULT_PAGE_SIZE, {
        no_totals: true,
        order_by: orderBy,
        page,
        not_tags: MATURE_TAGS,
      })
    ),
});

export default connect(
  select,
  perform
)(ClaimList);
