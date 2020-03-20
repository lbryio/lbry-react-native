import { connect } from 'react-redux';
import { selectMyChannelClaims, selectFetchingMyChannels, doFetchChannelListMine, doToast } from 'lbry-redux';
import {
  selectReferralReward,
  selectUserInvitesRemaining,
  selectUserInviteNewIsPending,
  selectUserInviteNewErrorMessage,
  selectUserInviteReferralLink,
  selectUserInviteReferralCode,
  selectUserInvitees,
  selectUserInviteStatusIsPending,
  doFetchInviteStatus,
  doUserInviteNew,
} from 'lbryinc';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { selectSdkReady } from 'redux/selectors/settings';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import InvitesPage from './view';

const select = state => ({
  channels: selectMyChannelClaims(state),
  errorMessage: selectUserInviteNewErrorMessage(state),
  fetchingChannels: selectFetchingMyChannels(state),
  fetchingInvitees: selectUserInviteStatusIsPending(state),
  invitees: selectUserInvitees(state),
  invitesRemaining: selectUserInvitesRemaining(state),
  isPending: selectUserInviteNewIsPending(state),
  referralCode: selectUserInviteReferralCode(state),
  referralReward: selectReferralReward(state),
  sdkReady: selectSdkReady(state),
});

const perform = dispatch => ({
  fetchChannelListMine: () => dispatch(doFetchChannelListMine(1, 99999, true)),
  fetchInviteStatus: () => dispatch(doFetchInviteStatus()),
  inviteNew: email => dispatch(doUserInviteNew(email)),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_INVITES)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
  notify: data => dispatch(doToast(data)),
});

export default connect(select, perform)(InvitesPage);
