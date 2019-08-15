import { connect } from 'react-redux';
import { doClaimSearch, selectFetchingClaimSearch, selectClaimSearchByQuery, selectFollowedTags } from 'lbry-redux';
import { selectSuggestedChannels, selectIsFetchingSuggested } from 'lbryinc';
import SuggestedSubscriptions from './view';

const select = state => ({
  followedTags: selectFollowedTags(state),
  suggested: selectSuggestedChannels(state),
  loading: selectIsFetchingSuggested(state) || selectFetchingClaimSearch(state),
  claimSearchByQuery: selectClaimSearchByQuery(state),
});

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(options)),
});

export default connect(
  select,
  perform
)(SuggestedSubscriptions);
