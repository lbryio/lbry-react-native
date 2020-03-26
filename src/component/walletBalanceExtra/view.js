// @flow
import React from 'react';
import { Text, View } from 'react-native';
import { formatCredits } from 'lbry-redux';
import { Lbryio } from 'lbryinc';
import { formatUsd } from 'utils/helper';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import walletStyle from 'styles/wallet';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api

type Props = {
  claimsBalance: number,
  supportsBalance: number,
  tipsBalance: number,
};

class WalletBalanceExtra extends React.PureComponent<Props> {
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
    const { claimsBalance, deviceWalletSynced, navigation, supportsBalance, tipsBalance } = this.props;

    return (
      <View style={walletStyle.balanceExtra}>
        <View style={walletStyle.usdInfoCard}>
          <Text style={walletStyle.usdInfoText}>
            You can convert your credits to USD and withdraw the converted amount using an exchange.{' '}
            <Link
              style={walletStyle.usdConvertFaqLink}
              href={'https://lbry.com/faq/exchanges'}
              text={__('Learn more')}
            />
            .
          </Text>
          <Link
            style={walletStyle.usdConvertLink}
            href={'https://bittrex.com/Account/Register?referralCode=4M1-P30-BON'}
            text={__('Convert credits to USD on Bittrex')}
          />
        </View>

        <View style={walletStyle.balanceExtraCard}>
          <View style={walletStyle.walletExtraRow}>
            <View style={walletStyle.walletExtraCol}>
              <Icon style={walletStyle.walletExtraIcon} color={Colors.LbryGreen} name={'gift'} size={16} />
              <Text style={walletStyle.walletExtraCaption}>{__('You also have')}</Text>
              <View style={walletStyle.balanceRow}>
                <Text style={walletStyle.walletExtraBalance}>{formatCredits(parseFloat(tipsBalance), 2)}</Text>
                <Text style={walletStyle.walletExtraCurrency}>LBC</Text>
              </View>
              <Text style={walletStyle.usdWalletExtraBalance}>
                &asymp;{formatUsd(parseFloat(tipsBalance) * parseFloat(this.state.usdExchangeRate))}
              </Text>
              <Text style={walletStyle.text}>{__('in tips')}</Text>

              <Link
                style={walletStyle.earnTipsLink}
                onPress={() => {
                  navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH });
                }}
                text={__('Earn more tips by uploading cool videos')}
              />
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

        <View style={walletStyle.syncDriverCustody}>
          <Text style={walletStyle.syncInfoText}>
            {deviceWalletSynced
              ? __('A backup of your wallet is synced with lbry.tv')
              : __('Your wallet is not currently synced with lbry.tv. You are responsible for backing up your wallet.')}
          </Text>
          <Link
            text={__('What does this mean?')}
            href={
              deviceWalletSynced
                ? 'https://lbry.com/faq/account-sync'
                : 'https://lbry.com/faq/how-to-backup-wallet#android'
            }
            style={walletStyle.syncInfoLink}
          />
        </View>
      </View>
    );
  }
}

export default WalletBalanceExtra;
