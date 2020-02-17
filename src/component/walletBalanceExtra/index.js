import { connect } from 'react-redux';
import { selectClaimsBalance, selectSupportsBalance, selectTipsBalance } from 'lbry-redux';
import WalletBalanceExtra from './view';

const select = state => ({
  claimsBalance: selectClaimsBalance(state) || 0,
  supportsBalance: selectSupportsBalance(state) || 0,
  tipsBalance: selectTipsBalance(state) || 0,
});

export default connect(
  select,
  null,
)(WalletBalanceExtra);
