import { connect } from 'react-redux';
import { doClaimSearch, selectFetchingClaimSearch, selectClaimSearchByQuery, selectFollowedTags } from 'lbry-redux';
import { selectSuggestedChannels, selectIsFetchingSuggested } from 'lbryinc';
import { selectShowNsfw } from 'redux/selectors/settings';
import SuggestedSubscriptionsGrid from './view';

const select = state => ({
  followedTags: selectFollowedTags(state),
  suggested: selectSuggestedChannels(state),
  loading: selectIsFetchingSuggested(state) || selectFetchingClaimSearch(state),
  claimSearchByQuery: selectClaimSearchByQuery(state),
  showNsfwContent: selectShowNsfw(state),
});

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(options)),
});

export default connect(
  select,
  perform,
)(SuggestedSubscriptionsGrid);
