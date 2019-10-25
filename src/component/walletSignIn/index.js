import { connect } from 'react-redux';
import { doToast } from 'lbry-redux';
import { doSetClientSetting } from 'redux/actions/settings';
import { selectUser } from 'lbryinc';
import WalletSignIn from './view';

const select = state => ({
  user: selectUser(state),
});

const perform = dispatch => ({
  notify: data => dispatch(doToast(data)),
  setClientSetting: (key, value) => dispatch(doSetClientSetting(key, value)),
});

export default connect(
  select,
  perform
)(WalletSignIn);
