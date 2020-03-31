import { connect } from 'react-redux';
import { selectClaimsBalance, selectSupportsBalance, selectTipsBalance } from 'lbry-redux';
import { makeSelectClientSetting } from 'redux/selectors/settings';
import WalletBalanceExtra from './view';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

const select = state => ({
  claimsBalance: selectClaimsBalance(state) || 0,
  deviceWalletSynced: makeSelectClientSetting(Constants.SETTING_DEVICE_WALLET_SYNCED)(state),
  supportsBalance: selectSupportsBalance(state) || 0,
  tipsBalance: selectTipsBalance(state) || 0,
});

export default connect(select, null)(WalletBalanceExtra);
