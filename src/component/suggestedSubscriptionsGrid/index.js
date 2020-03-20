import { connect } from 'react-redux';
import {
  doClaimSearch,
  selectFetchingClaimSearch,
  selectClaimSearchByQuery,
  selectClaimSearchByQueryLastPageReached,
  selectFollowedTags,
} from 'lbry-redux';
import { selectSubscriptions, selectSuggestedChannels, selectIsFetchingSuggested } from 'lbryinc';
import { selectShowNsfw } from 'redux/selectors/settings';
import SuggestedSubscriptionsGrid from './view';

const select = state => ({
  followedTags: selectFollowedTags(state),
  subscriptions: selectSubscriptions(state),
  suggested: selectSuggestedChannels(state),
  loading: selectIsFetchingSuggested(state) || selectFetchingClaimSearch(state),
  claimSearchByQuery: selectClaimSearchByQuery(state),
  lastPageReached: selectClaimSearchByQueryLastPageReached(state),
  showNsfwContent: selectShowNsfw(state),
});

const perform = dispatch => ({
  claimSearch: options => dispatch(doClaimSearch(options)),
});

export default connect(select, perform)(SuggestedSubscriptionsGrid);
