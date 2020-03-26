import { connect } from 'react-redux';
import { doToast, selectBalance, selectMyChannelClaims } from 'lbry-redux';
import { selectUnclaimedRewardValue, selectUser } from 'lbryinc';
import { selectSdkReady } from 'redux/selectors/settings';
import DrawerContent from './view';

const select = state => ({
  balance: selectBalance(state),
  channels: selectMyChannelClaims(state),
  sdkReady: selectSdkReady(state),
  unclaimedRewardAmount: selectUnclaimedRewardValue(state),
  user: selectUser(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
});

export default connect(select, perform)(DrawerContent);
