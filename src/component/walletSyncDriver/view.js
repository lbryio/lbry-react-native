import React from 'react';
import { Alert, NativeModules, Switch, Text, View } from 'react-native';
import Button from 'component/button';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Link from 'component/link';
import walletStyle from 'styles/wallet';

class WalletSyncDriver extends React.PureComponent<Props> {
  handleSyncStatusChange = value => {
    const { navigation, notify, setClientSetting } = this.props;
    if (value) {
      // enabling
      navigation.navigate({ routeName: 'Verification', key: 'verification', params: { syncFlow: true } });
    } else {
      // turning off
      // set deviceWalletSynced to false (if confirmed)
      Alert.alert(
        __('Disable wallet sync'),
        __('Are you sure you want to turn off wallet sync?'),
        [
          { text: __('No') },
          {
            text: __('Yes'),
            onPress: () => {
              setClientSetting(Constants.SETTING_DEVICE_WALLET_SYNCED, false);
              notify({ message: __('Wallet sync was successfully disabled.') });
            },
          },
        ],
        { cancelable: true },
      );
    }
  };

  render() {
    const { deviceWalletSynced, userEmail } = this.props;

    return (
      <View style={walletStyle.syncDriverCard}>
        <Text style={walletStyle.syncDriverTitle}>{__('Wallet Sync')}</Text>
        <View style={walletStyle.switchRow}>
          <View style={walletStyle.tableCol}>
            <Text style={walletStyle.labelText}>{__('Sync status')}</Text>
          </View>
          <View style={walletStyle.tableColRow}>
            <Text selectable style={walletStyle.valueText}>
              {deviceWalletSynced ? __('On') : __('Off')}
            </Text>
            <Switch
              style={walletStyle.syncSwitch}
              value={deviceWalletSynced}
              onValueChange={this.handleSyncStatusChange}
            />
          </View>
        </View>
        {deviceWalletSynced && (
          <View style={walletStyle.tableRow}>
            <View style={walletStyle.tableCol}>
              <Text style={walletStyle.labelText}>{__('Connected email')}</Text>
            </View>
            <View style={walletStyle.tableCol}>
              <Text selectable style={walletStyle.valueText} numberOfLines={1}>
                {userEmail || __('No connected email')}
              </Text>
            </View>
          </View>
        )}

        <View style={walletStyle.linkRow}>
          <View style={walletStyle.tableCol}>
            <Link
              text={__('Manual backup')}
              href="https://lbry.com/faq/how-to-backup-wallet#android"
              style={walletStyle.syncDriverLink}
            />
          </View>
          <View style={walletStyle.rightTableCol}>
            {!deviceWalletSynced && (
              <Link
                text={__('Sync FAQ')}
                href="https://lbry.com/faq/how-to-backup-wallet#sync"
                style={[walletStyle.syncDriverLink, walletStyle.rightLink]}
              />
            )}
          </View>
        </View>
      </View>
    );
  }
}

export default WalletSyncDriver;
