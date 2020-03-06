import { connect } from 'react-redux';
import {
  selectBalance,
  selectMyChannelClaims,
  selectFetchingMyChannels,
  doFetchChannelListMine,
  doCreateChannel,
  doToast,
} from 'lbry-redux';
import { doGetSync } from 'lbryinc';
import ChannelSelector from './view';

const select = state => ({
  channels: selectMyChannelClaims(state),
  fetchingChannels: selectFetchingMyChannels(state),
  balance: selectBalance(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
  createChannel: (name, amount) => dispatch(doCreateChannel(name, amount)),
  fetchChannelListMine: () => dispatch(doFetchChannelListMine(1, 99999, true)),
  getSync: (password, callback) => dispatch(doGetSync(password, callback)),
});

export default connect(
  select,
  perform,
)(ChannelSelector);
