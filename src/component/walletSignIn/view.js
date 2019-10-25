import React from 'react';
import { Linking, NativeModules, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Button from 'component/button';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Link from 'component/link';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import walletStyle from 'styles/wallet';

class WalletSignIn extends React.Component {
  onContinuePressed = () => {
    const { navigation, setClientSetting } = this.props;
    setClientSetting(Constants.SETTING_ALPHA_UNDERSTANDS_RISKS, true);
  };

  onSignInPressed = () => {
    const { navigation } = this.props;
    navigation.navigate({ routeName: 'Verification', key: 'verification', params: { syncFlow: true } });
  };

  render() {
    const { navigation, user } = this.props;

    return (
      <View style={walletStyle.signInContainer}>
        <View style={walletStyle.signInSummaryRow}>
          <Text style={walletStyle.signInTitle}>Sign in</Text>
        </View>

        <View style={walletStyle.onboarding}>
          <Text style={walletStyle.onboardingText}>
            An account will allow you to earn rewards and keep your account and settings synced.{'\n\n'}
            Without an account, you will not receive rewards, sync and backup services, or security updates.{'\n\n'}
          </Text>
        </View>

        <View style={walletStyle.buttonRow}>
          <Link style={walletStyle.continueLink} text={'Continue anyway'} onPress={this.onContinuePressed} />
          <Button style={walletStyle.signInButton} theme={'light'} text={'Sign in'} onPress={this.onSignInPressed} />
        </View>
      </View>
    );
  }
}

export default WalletSignIn;
