import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import walletStyle from 'styles/wallet';

class WalletRewardsDriver extends React.PureComponent<Props> {
  render() {
    const { navigation, unclaimedRewardAmount, user } = this.props;
    const signedIn = user && user.has_verified_email;

    return (
      <TouchableOpacity style={walletStyle.rewardDriverCard} onPress={() => navigation.navigate('Rewards')}>
        <Icon name="award" size={16} style={walletStyle.rewardIcon} />
        {signedIn && (
          <Text style={walletStyle.rewardDriverText}>
            {unclaimedRewardAmount === 0 && __('Free credits available in rewards.')}
            {unclaimedRewardAmount === 1 &&
              __('%amount% free credit available in rewards.', { amount: unclaimedRewardAmount })}
            {unclaimedRewardAmount > 1 &&
              __('%amount% free credits available in rewards.', { amount: unclaimedRewardAmount })}{' '}
            {__('Tap to learn more.')}
          </Text>
        )}

        {!signedIn && (
          <Text style={walletStyle.rewardDriverText}>
            {unclaimedRewardAmount === 1 &&
              __('Get %amount% free credit after creating an account.', { amount: unclaimedRewardAmount })}
            {unclaimedRewardAmount !== 1 &&
              __('Get %amount% free credits after creating an account.', { amount: unclaimedRewardAmount })}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
}

export default WalletRewardsDriver;
