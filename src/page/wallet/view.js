import React from 'react';
import { NativeModules, ScrollView, Text, View } from 'react-native';
import EmptyStateView from 'component/emptyStateView';
import TransactionListRecent from 'component/transactionListRecent';
import WalletAddress from 'component/walletAddress';
import WalletBalance from 'component/walletBalance';
import WalletBalanceExtra from 'component/walletBalanceExtra';
import WalletSend from 'component/walletSend';
import WalletRewardsDriver from 'component/walletRewardsDriver';
import WalletSignIn from 'component/walletSignIn';
import WalletSyncDriver from 'component/walletSyncDriver';
import UriBar from 'component/uriBar';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import walletStyle from 'styles/wallet';

class WalletPage extends React.PureComponent {
  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
  }

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.FULL_ROUTE_NAME_WALLET === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  onComponentFocused = () => {
    const { pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Wallet');

    const { deviceWalletSynced, getSync, user } = this.props;
    if (deviceWalletSynced && user && user.has_verified_email) {
      NativeModules.UtilityModule.getSecureValue(Constants.KEY_WALLET_PASSWORD).then(walletPassword => {
        getSync(walletPassword);
      });
    }
  };

  onDismissBackupPressed = () => {
    const { setClientSetting } = this.props;
    setClientSetting(Constants.SETTING_BACKUP_DISMISSED, true);
  };

  render() {
    const { balance, rewardsNotInterested, understandsRisks, navigation, sdkReady, user } = this.props;

    if (!sdkReady) {
      return (
        <View style={walletStyle.container}>
          <UriBar navigation={navigation} />
          <EmptyStateView
            message={__(
              'The background service is still initializing. You can still explore and watch content during the initialization process.',
            )}
          />
        </View>
      );
    }

    const signedIn = user && user.has_verified_email;
    if (!signedIn && !understandsRisks) {
      return (
        <View style={walletStyle.container}>
          <UriBar navigation={navigation} />
          <WalletSignIn navigation={navigation} />
        </View>
      );
    }

    return (
      <View style={walletStyle.container}>
        <UriBar navigation={navigation} />
        <ScrollView
          style={walletStyle.scrollContainer}
          keyboardShouldPersistTaps={'handled'}
          removeClippedSubviews={false}
        >
          {!rewardsNotInterested && (!balance || balance === 0) && <WalletRewardsDriver navigation={navigation} />}
          <WalletBalance />
          <WalletBalanceExtra navigation={navigation} />
          <WalletAddress />
          <WalletSend />
          <TransactionListRecent navigation={navigation} />
          <WalletSyncDriver navigation={navigation} />
        </ScrollView>
      </View>
    );
  }
}

export default WalletPage;
