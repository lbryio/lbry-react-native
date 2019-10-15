import { connect } from 'react-redux';
import { doBalanceSubscribe, doUpdateBlockHeight, doPopulateSharedUserState, doToast } from 'lbry-redux';
import {
  doAuthenticate,
  doBlackListedOutpointsSubscribe,
  doFilteredOutpointsSubscribe,
  doCheckSubscriptionsInit,
  doFetchMySubscriptions,
  doFetchRewardedContent,
  doGetSync,
  doUserEmailToVerify,
  doUserEmailVerify,
  doUserEmailVerifyFailure,
  selectUser,
  selectEmailToVerify,
} from 'lbryinc';
import { doSetClientSetting } from 'redux/actions/settings';
import SplashScreen from './view';

const select = state => ({
  user: selectUser(state),
  emailToVerify: selectEmailToVerify(state),
});

const perform = dispatch => ({
  authenticate: (appVersion, os, firebaseToken) => dispatch(doAuthenticate(appVersion, os, firebaseToken)),
  balanceSubscribe: () => dispatch(doBalanceSubscribe()),
  blacklistedOutpointsSubscribe: () => dispatch(doBlackListedOutpointsSubscribe()),
  filteredOutpointsSubscribe: () => dispatch(doFilteredOutpointsSubscribe()),
  checkSubscriptionsInit: () => dispatch(doCheckSubscriptionsInit()),
  fetchRewardedContent: () => dispatch(doFetchRewardedContent()),
  fetchSubscriptions: callback => dispatch(doFetchMySubscriptions(callback)),
  getSync: password => dispatch(doGetSync(password)),
  notify: data => dispatch(doToast(data)),
  setClientSetting: (key, value) => dispatch(doSetClientSetting(key, value)),
  setEmailToVerify: email => dispatch(doUserEmailToVerify(email)),
  populateSharedUserState: settings => dispatch(doPopulateSharedUserState(settings)),
  updateBlockHeight: () => dispatch(doUpdateBlockHeight()),
  verifyUserEmail: (token, recaptcha) => dispatch(doUserEmailVerify(token, recaptcha)),
  verifyUserEmailFailure: error => dispatch(doUserEmailVerifyFailure(error)),
});

export default connect(
  select,
  perform
)(SplashScreen);
