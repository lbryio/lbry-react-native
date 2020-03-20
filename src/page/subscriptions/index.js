import { connect } from 'react-redux';
import {
  doChannelUnsubscribe,
  doFetchMySubscriptions,
  doSetViewMode,
  doFetchRecommendedSubscriptions,
  selectSubscriptionClaims,
  selectSubscriptions,
  selectIsFetchingSubscriptions,
  selectSuggestedChannels,
  selectUnreadSubscriptions,
  selectViewMode,
  selectFirstRunCompleted,
  selectShowSuggestedSubs,
} from 'lbryinc';
import { doToast, selectFetchingClaimSearch } from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doSetClientSetting, doSetTimeItem } from 'redux/actions/settings';
import { makeSelectClientSetting, selectSdkReady, selectTimeItem } from 'redux/selectors/settings';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import SubscriptionsPage from './view';

const select = state => ({
  currentRoute: selectCurrentRoute(state),
  loading: selectIsFetchingSubscriptions(state),
  loadingSuggested: selectFetchingClaimSearch(state),
  subscribedChannels: selectSubscriptions(state),
  suggestedChannels: selectSuggestedChannels(state),
  subscriptionsViewMode: makeSelectClientSetting(Constants.SETTING_SUBSCRIPTIONS_VIEW_MODE)(state),
  allSubscriptions: selectSubscriptionClaims(state),
  unreadSubscriptions: selectUnreadSubscriptions(state),
  viewMode: selectViewMode(state),
  firstRunCompleted: selectFirstRunCompleted(state),
  showSuggestedSubs: selectShowSuggestedSubs(state),
  timeItem: selectTimeItem(state),
  sdkReady: selectSdkReady(state),
});

const perform = dispatch => ({
  channelUnsubscribe: subscription => dispatch(doChannelUnsubscribe(subscription)),
  doFetchMySubscriptions: () => dispatch(doFetchMySubscriptions()),
  doFetchRecommendedSubscriptions: () => dispatch(doFetchRecommendedSubscriptions()),
  doSetViewMode: viewMode => dispatch(doSetViewMode(viewMode)),
  notify: data => dispatch(doToast(data)),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_SUBSCRIPTIONS)),
  setClientSetting: (key, value) => dispatch(doSetClientSetting(key, value)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
  setTimeItem: item => dispatch(doSetTimeItem(item)),
});

export default connect(select, perform)(SubscriptionsPage);
