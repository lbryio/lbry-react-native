import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import walletStyle from 'styles/wallet';

class WalletRewardsDriver extends React.PureComponent<Props> {
  render() {
    const { navigation, unclaimedRewardAmount } = this.props;

    return (
      <TouchableOpacity style={walletStyle.rewardDriverCard} onPress={() => navigation.navigate('Rewards')}>
        <Icon name="award" size={16} style={walletStyle.rewardIcon} />
        <Text style={walletStyle.rewardDriverText}>
          Get {unclaimedRewardAmount > 0 ? unclaimedRewardAmount : ''} free credit
          {unclaimedRewardAmount === 1 ? '' : 's'} after creating an account.
        </Text>
      </TouchableOpacity>
    );
  }
}

export default WalletRewardsDriver;
