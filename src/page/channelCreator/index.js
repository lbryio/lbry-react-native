import { connect } from 'react-redux';
import {
  selectAbandoningIds,
  selectBalance,
  selectMyChannelClaims,
  selectFetchingMyChannels,
  selectUpdatingChannel,
  selectUpdateChannelError,
  doAbandonClaim,
  doFetchChannelListMine,
  doCreateChannel,
  doUpdateChannel,
  doToast,
} from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import ChannelCreator from './view';

const select = state => ({
  abandoningClaimIds: selectAbandoningIds(state),
  channels: selectMyChannelClaims(state),
  fetchingChannels: selectFetchingMyChannels(state),
  balance: selectBalance(state),
  updatingChannel: selectUpdatingChannel(state),
  updateChannelError: selectUpdateChannelError(state),
});

const perform = dispatch => ({
  abandonClaim: (txid, nout) => dispatch(doAbandonClaim(txid, nout)),
  notify: data => dispatch(doToast(data)),
  createChannel: (name, amount, optionalParams) => dispatch(doCreateChannel(name, amount, optionalParams)),
  updateChannel: params => dispatch(doUpdateChannel(params)),
  fetchChannelListMine: () => dispatch(doFetchChannelListMine()),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_CHANNEL_CREATOR)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(ChannelCreator);
