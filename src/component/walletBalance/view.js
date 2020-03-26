// @flow
import React from 'react';
import { Image, Text, View } from 'react-native';
import { formatCredits } from 'lbry-redux';
import { Lbryio } from 'lbryinc';
import { formatUsd } from 'utils/helper';
import walletStyle from 'styles/wallet';

type Props = {
  balance: number,
};

class WalletBalance extends React.PureComponent<Props> {
  state = {
    usdExchangeRate: 0,
  };

  componentDidMount() {
    Lbryio.getExchangeRates().then(rates => {
      if (!isNaN(rates.LBC_USD)) {
        this.setState({ usdExchangeRate: rates.LBC_USD });
      }
    });
  }

  render() {
    const { balance } = this.props;
    return (
      <View style={walletStyle.balanceCard}>
        <Image style={walletStyle.balanceBackground} resizeMode={'cover'} source={require('../../assets/stripe.png')} />
        <Text style={walletStyle.balanceTitle}>{__('Balance')}</Text>
        <Text style={walletStyle.balanceCaption}>{__('You currently have')}</Text>
        <Text style={walletStyle.balance}>
          {(balance || balance === 0) && formatCredits(parseFloat(balance), 2) + ' LBC'}
        </Text>
        <Text style={walletStyle.usdBalance}>
          {this.state.usdExchangeRate > 0 && (
            <Text>
              &asymp;{formatUsd(isNaN(balance) ? 0 : parseFloat(balance) * parseFloat(this.state.usdExchangeRate))}
            </Text>
          )}
        </Text>
      </View>
    );
  }
}

export default WalletBalance;
