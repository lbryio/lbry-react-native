import { connect } from 'react-redux';
import { SETTINGS, doBalanceSubscribe, doUpdateBlockHeight, doPopulateSharedUserState, doToast } from 'lbry-redux';
import {
  doAuthenticate,
  doBlackListedOutpointsSubscribe,
  doFilteredOutpointsSubscribe,
  doFetchMySubscriptions,
  doFetchRewardedContent,
  doGetSync,
  doUserEmailToVerify,
  doUserEmailVerify,
  doUserEmailVerifyFailure,
  selectAuthenticationIsPending,
  selectUser,
  selectEmailToVerify,
} from 'lbryinc';
import { doSetClientSetting } from 'redux/actions/settings';
import { selectLastRouteInStack } from 'redux/selectors/drawer';
import SplashScreen from './view';

const select = state => ({
  authIsPending: selectAuthenticationIsPending(state),
  user: selectUser(state),
  emailToVerify: selectEmailToVerify(state),
  lastRouteInStack: selectLastRouteInStack(state),
});

const perform = dispatch => ({
  authenticate: (appVersion, os, firebaseToken) => dispatch(doAuthenticate(appVersion, os, firebaseToken)),
  balanceSubscribe: () => dispatch(doBalanceSubscribe()),
  blacklistedOutpointsSubscribe: () => dispatch(doBlackListedOutpointsSubscribe()),
  filteredOutpointsSubscribe: () => dispatch(doFilteredOutpointsSubscribe()),
  fetchRewardedContent: () => dispatch(doFetchRewardedContent()),
  fetchSubscriptions: callback => dispatch(doFetchMySubscriptions(callback)),
  getSync: (password, callback) => dispatch(doGetSync(password, callback)),
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
  perform,
)(SplashScreen);
