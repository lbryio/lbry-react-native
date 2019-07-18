import { connect } from 'react-redux';
import {
  doClaimSearchByTags,
  makeSelectClaimSearchUrisForTags,
  makeSelectFetchingClaimSearchForTags,
} from 'lbry-redux';
import ClaimList from './view';

const select = (state, props) => {
  const tags = props.tags.join(',');
  return {
    loading: makeSelectFetchingClaimSearchForTags(tags)(state),
    uris: makeSelectClaimSearchUrisForTags(tags)(state),
  };
};

const perform = dispatch => ({
  searchByTags: (tags, orderBy = ['trending_global', 'trending_mixed'], page = 1) => dispatch(doClaimSearchByTags(tags, 10, { no_totals: true, order_by: orderBy, page })),
});

export default connect(
  select,
  perform
)(ClaimList);
