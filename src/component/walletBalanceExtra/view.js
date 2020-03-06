// @flow
import React from 'react';
import { Image, Text, View } from 'react-native';
import { Lbry, formatCredits } from 'lbry-redux';
import Address from 'component/address';
import Button from 'component/button';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import walletStyle from 'styles/wallet';

type Props = {
  claimsBalance: number,
  supportsBalance: number,
  tipsBalance: number,
};

class WalletBalanceExtra extends React.PureComponent<Props> {
  render() {
    const { claimsBalance, supportsBalance, tipsBalance } = this.props;

    return (
      <View style={walletStyle.balanceExtraCard}>
        <View style={walletStyle.walletExtraRow}>
          <View style={walletStyle.walletExtraCol}>
            <Icon style={walletStyle.walletExtraIcon} color={Colors.LbryGreen} name={'gift'} size={16} />
            <Text style={walletStyle.walletExtraCaption}>{__('You also have')}</Text>
            <View style={walletStyle.balanceRow}>
              <Text style={walletStyle.walletExtraBalance}>{formatCredits(parseFloat(tipsBalance), 2)}</Text>
              <Text style={walletStyle.walletExtraCurrency}>LBC</Text>
            </View>
            <Text style={walletStyle.text}>{__('in tips')}</Text>
          </View>

          <View style={walletStyle.walletExtraCol}>
            <Icon style={walletStyle.walletExtraIcon} color={Colors.LbryGreen} name={'lock'} size={16} />
            <Text style={walletStyle.walletExtraCaption}>{__('You staked')}</Text>
            <View style={walletStyle.balanceRow}>
              <Text style={walletStyle.walletExtraBalance}>{formatCredits(parseFloat(claimsBalance), 2)}</Text>
              <Text style={walletStyle.walletExtraCurrency}>LBC</Text>
            </View>
            <Text style={walletStyle.text}>{__('in your publishes')}</Text>
            <View style={[walletStyle.balanceRow, walletStyle.walletExtraTopMargin]}>
              <Text style={walletStyle.walletExtraBalance}>{formatCredits(parseFloat(supportsBalance), 2)}</Text>
              <Text style={walletStyle.walletExtraCurrency}>LBC</Text>
            </View>
            <Text style={walletStyle.text}>{__('in your supports')}</Text>
          </View>
        </View>
      </View>
    );
  }
}

export default WalletBalanceExtra;
