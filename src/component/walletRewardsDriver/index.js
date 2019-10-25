import { connect } from 'react-redux';
import { selectUnclaimedRewardValue } from 'lbryinc';
import WalletRewardsDriver from './view';

const select = state => ({
  unclaimedRewardAmount: selectUnclaimedRewardValue(state),
});

export default connect(select)(WalletRewardsDriver);
