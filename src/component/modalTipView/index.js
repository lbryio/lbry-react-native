import { connect } from 'react-redux';
import { doSendTip, doToast, selectBalance } from 'lbry-redux';
import { selectSdkReady } from 'redux/selectors/settings';
import ModalTipView from './view';

const select = state => ({
  balance: selectBalance(state),
  sdkReady: selectSdkReady(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
  sendTip: (amount, claimId, isSupport, successCallback, errorCallback) =>
    dispatch(doSendTip(amount, claimId, isSupport, successCallback, errorCallback)),
});

export default connect(select, perform)(ModalTipView);
