import { connect } from 'react-redux';
import { doToast, selectMyChannelClaims } from 'lbry-redux';
import { selectUser } from 'lbryinc';
import { selectSdkReady } from 'redux/selectors/settings';
import DrawerContent from './view';

const select = state => ({
  channels: selectMyChannelClaims(state),
  sdkReady: selectSdkReady(state),
  user: selectUser(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
});

export default connect(select, perform)(DrawerContent);
