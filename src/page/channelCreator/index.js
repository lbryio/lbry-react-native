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
import { doPushDrawerStack, doPopDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doUpdateChannelFormState, doClearChannelFormState } from 'redux/actions/form';
import { selectDrawerStack } from 'redux/selectors/drawer';
import { selectChannelFormState, selectHasChannelFormState } from 'redux/selectors/form';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import ChannelCreator from './view';

const select = state => ({
  abandoningClaimIds: selectAbandoningIds(state),
  channels: selectMyChannelClaims(state),
  channelFormState: selectChannelFormState(state),
  drawerStack: selectDrawerStack(state),
  fetchingChannels: selectFetchingMyChannels(state),
  balance: selectBalance(state),
  hasFormState: selectHasChannelFormState(state),
  updatingChannel: selectUpdatingChannel(state),
  updateChannelError: selectUpdateChannelError(state),
});

const perform = dispatch => ({
  abandonClaim: (txid, nout) => dispatch(doAbandonClaim(txid, nout)),
  notify: data => dispatch(doToast(data)),
  clearChannelFormState: () => dispatch(doClearChannelFormState()),
  createChannel: (name, amount, optionalParams) => dispatch(doCreateChannel(name, amount, optionalParams)),
  fetchChannelListMine: () => dispatch(doFetchChannelListMine()),
  updateChannel: params => dispatch(doUpdateChannel(params)),
  updateChannelFormState: data => dispatch(doUpdateChannelFormState(data)),
  pushDrawerStack: (routeName, params) => dispatch(doPushDrawerStack(routeName, params)),
  popDrawerStack: () => dispatch(doPopDrawerStack()),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(ChannelCreator);
