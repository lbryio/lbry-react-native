import { connect } from 'react-redux';
import {
  doChannelUnsubscribe,
  doFetchMySubscriptions,
  doSetViewMode,
  doFetchRecommendedSubscriptions,
  selectSubscriptionClaims,
  selectSubscriptions,
  selectIsFetchingSubscriptions,
  selectIsFetchingSuggested,
  selectSuggestedChannels,
  selectUnreadSubscriptions,
  selectViewMode,
  selectFirstRunCompleted,
  selectShowSuggestedSubs,
} from 'lbryinc';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doSetClientSetting, doSetTimeItem } from 'redux/actions/settings';
import { makeSelectClientSetting, selectTimeItem } from 'redux/selectors/settings';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import SubscriptionsPage from './view';

const select = state => ({
  currentRoute: selectCurrentRoute(state),
  loading: selectIsFetchingSubscriptions(state),
  loadingSuggested: selectIsFetchingSuggested(state),
  subscribedChannels: selectSubscriptions(state),
  suggestedChannels: selectSuggestedChannels(state),
  subscriptionsViewMode: makeSelectClientSetting(Constants.SETTING_SUBSCRIPTIONS_VIEW_MODE)(state),
  allSubscriptions: selectSubscriptionClaims(state),
  unreadSubscriptions: selectUnreadSubscriptions(state),
  viewMode: selectViewMode(state),
  firstRunCompleted: selectFirstRunCompleted(state),
  showSuggestedSubs: selectShowSuggestedSubs(state),
  timeItem: selectTimeItem(state),
});

const perform = dispatch => ({
  channelUnsubscribe: subscription => dispatch(doChannelUnsubscribe(subscription)),
  doFetchMySubscriptions: () => dispatch(doFetchMySubscriptions()),
  doFetchRecommendedSubscriptions: () => dispatch(doFetchRecommendedSubscriptions()),
  doSetViewMode: viewMode => dispatch(doSetViewMode(viewMode)),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_SUBSCRIPTIONS)),
  setClientSetting: (key, value) => dispatch(doSetClientSetting(key, value)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
  setTimeItem: item => dispatch(doSetTimeItem(item)),
});

export default connect(
  select,
  perform
)(SubscriptionsPage);
