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
import { doPushDrawerStack, doPopDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doUpdateChannelFormState, doClearChannelFormState } from 'redux/actions/form';
import { selectDrawerStack } from 'redux/selectors/drawer';
import { selectChannelFormState, selectHasChannelFormState } from 'redux/selectors/form';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import InvitesPage from './view';

const select = state => ({
  channels: selectMyChannelClaims(state),
  fetchingChannels: selectFetchingMyChannels(state),
  fetchingInvitees: selectUserInviteStatusIsPending(state),
  errorMessage: selectUserInviteNewErrorMessage(state),
  invitesRemaining: selectUserInvitesRemaining(state),
  referralCode: selectUserInviteReferralCode(state),
  isPending: selectUserInviteNewIsPending(state),
  invitees: selectUserInvitees(state),
  referralReward: selectReferralReward(state),
});

const perform = dispatch => ({
  fetchChannelListMine: () => dispatch(doFetchChannelListMine()),
  fetchInviteStatus: () => dispatch(doFetchInviteStatus()),
  inviteNew: email => dispatch(doUserInviteNew(email)),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_INVITES)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
  notify: data => dispatch(doToast(data)),
});

export default connect(
  select,
  perform,
)(InvitesPage);
