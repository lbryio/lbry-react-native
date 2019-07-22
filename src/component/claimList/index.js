import { connect } from 'react-redux';
import {
  doClaimSearch,
  doClaimSearchByTags,
  makeSelectClaimSearchUrisForTags,
  makeSelectFetchingClaimSearchForTags,
  selectFetchingClaimSearch,
  selectLastClaimSearchUris,
} from 'lbry-redux';
import ClaimList from './view';

const defaultOrderBy = ['trending_global', 'trending_mixed'];

const select = (state, props) => {
  const tags = props.tags ? props.tags.join(',') : '';
  return {
    loading: makeSelectFetchingClaimSearchForTags(tags)(state),
    uris: makeSelectClaimSearchUrisForTags(tags)(state),
    // for subscriptions
    claimSearchLoading: selectFetchingClaimSearch(state),
    claimSearchUris: selectLastClaimSearchUris(state),
  };
};

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(10, options)),
  searchByTags: (tags, orderBy = defaultOrderBy, page = 1) =>
    dispatch(doClaimSearchByTags(tags, 10, { no_totals: true, order_by: orderBy, page })),
});

export default connect(
  select,
  perform
)(ClaimList);
