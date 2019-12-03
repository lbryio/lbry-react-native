import { connect } from 'react-redux';
import { selectUnclaimedRewardValue, selectUser } from 'lbryinc';
import WalletRewardsDriver from './view';

const select = state => ({
  unclaimedRewardAmount: selectUnclaimedRewardValue(state),
  user: selectUser(state),
});

export default connect(select)(WalletRewardsDriver);
