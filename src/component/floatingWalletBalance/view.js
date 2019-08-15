// @flow
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { formatBigNumberCredits } from 'lbry-redux';
import Address from 'component/address';
import Button from 'component/button';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import floatingButtonStyle from 'styles/floatingButton';

type Props = {
  balance: number,
};

class FloatingWalletBalance extends React.PureComponent<Props> {
  render() {
    const { balance, navigation, rewardsNotInterested, unclaimedRewardAmount } = this.props;

    return (
      <View style={[floatingButtonStyle.view, floatingButtonStyle.bottomRight]}>
        {!rewardsNotInterested && unclaimedRewardAmount > 0 && (
          <TouchableOpacity
            style={floatingButtonStyle.pendingContainer}
            onPress={() => navigation && navigation.navigate({ routeName: 'Rewards' })}
          >
            <Icon name="award" size={14} style={floatingButtonStyle.rewardIcon} />
            <Text style={floatingButtonStyle.text}>{unclaimedRewardAmount}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={floatingButtonStyle.container}
          onPress={() => navigation && navigation.navigate({ routeName: 'WalletStack' })}
        >
          <Icon name="coins" size={12} style={floatingButtonStyle.balanceIcon} />
          {isNaN(balance) && <ActivityIndicator size="small" color={Colors.White} />}
          {(!isNaN(balance) || balance === 0) && (
            <Text style={floatingButtonStyle.text}>{formatBigNumberCredits(parseFloat(balance), 0)}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
}

export default FloatingWalletBalance;
