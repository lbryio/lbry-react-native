import { connect } from 'react-redux';
import {
  selectBalance,
  selectMyChannelClaims,
  selectFetchingMyChannels,
  doFetchChannelListMine,
  doCreateChannel,
  doToast,
} from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import ChannelCreator from './view';

const select = state => ({
  channels: selectMyChannelClaims(state),
  fetchingChannels: selectFetchingMyChannels(state),
  balance: selectBalance(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
  createChannel: (name, amount) => dispatch(doCreateChannel(name, amount)),
  fetchChannelListMine: () => dispatch(doFetchChannelListMine()),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_CHANNEL_CREATOR)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(ChannelCreator);
