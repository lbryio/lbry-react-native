import { connect } from 'react-redux';
import { doClaimSearch, selectFetchingClaimSearch, selectLastClaimSearchUris, selectFollowedTags } from 'lbry-redux';
import { selectSuggestedChannels, selectIsFetchingSuggested } from 'lbryinc';
import SuggestedSubscriptions from './view';

const select = state => ({
  followedTags: selectFollowedTags(state),
  suggested: selectSuggestedChannels(state),
  loading: selectIsFetchingSuggested(state),
  claimSearchLoading: selectFetchingClaimSearch(state),
  claimSearchUris: selectLastClaimSearchUris(state),
});

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(10, options)),
});

export default connect(
  select,
  perform
)(SuggestedSubscriptions);
