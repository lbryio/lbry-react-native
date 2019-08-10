import { connect } from 'react-redux';
import {
  doClaimSearch,
  doFileList,
  selectBalance,
  selectFileInfosDownloaded,
  selectLastClaimSearchUris,
  selectFollowedTags,
} from 'lbry-redux';
import {
  doFetchFeaturedUris,
  doFetchRewardedContent,
  doFetchMySubscriptions,
  doRemoveUnreadSubscriptions,
  selectEnabledChannelNotifications,
  selectFeaturedUris,
  selectFetchingFeaturedUris,
  selectSubscriptionClaims,
  selectUnreadSubscriptions,
} from 'lbryinc';
import { doSetClientSetting, doSetSortByItem } from 'redux/actions/settings';
import { makeSelectClientSetting, selectSortByItem } from 'redux/selectors/settings';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import DiscoverPage from './view';

const select = state => ({
  allSubscriptions: selectSubscriptionClaims(state),
  balance: selectBalance(state),
  enabledChannelNotifications: selectEnabledChannelNotifications(state),
  featuredUris: selectFeaturedUris(state),
  fetchingFeaturedUris: selectFetchingFeaturedUris(state),
  fileInfos: selectFileInfosDownloaded(state),
  followedTags: selectFollowedTags(state),
  ratingReminderDisabled: makeSelectClientSetting(Constants.SETTING_RATING_REMINDER_DISABLED)(state),
  ratingReminderLastShown: makeSelectClientSetting(Constants.SETTING_RATING_REMINDER_LAST_SHOWN)(state),
  sortByItem: selectSortByItem(state),
  unreadSubscriptions: selectUnreadSubscriptions(state),
  uris: selectLastClaimSearchUris(state),
});

const perform = dispatch => ({
  doClaimSearch,
  fetchFeaturedUris: () => dispatch(doFetchFeaturedUris()),
  fetchRewardedContent: () => dispatch(doFetchRewardedContent()),
  fetchSubscriptions: () => dispatch(doFetchMySubscriptions()),
  fileList: () => dispatch(doFileList()),
  removeUnreadSubscriptions: () => dispatch(doRemoveUnreadSubscriptions()),
  setClientSetting: (key, value) => dispatch(doSetClientSetting(key, value)),
  setSortByItem: item => dispatch(doSetSortByItem(item)),
});

export default connect(
  select,
  perform
)(DiscoverPage);
