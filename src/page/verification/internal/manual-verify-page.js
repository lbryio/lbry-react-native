import React from 'react';
import { Lbry } from 'lbry-redux';
import { ActivityIndicator, View, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Button from 'component/button';
import Link from 'component/link';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import firstRunStyle from 'styles/firstRun';
import rewardStyle from 'styles/reward';

class ManualVerifyPage extends React.PureComponent {
  componentDidMount() {
    const { setEmailVerificationPhase } = this.props;
    if (setEmailVerificationPhase) {
      setEmailVerificationPhase(false);
    }
  }

  render() {
    return (
      <View style={firstRunStyle.container}>
        <Text style={rewardStyle.verificationTitle}>{__('Manual Reward Verification')}</Text>
        <Text style={firstRunStyle.spacedParagraph}>
          {__(
            'This account must undergo review before you can participate in the rewards program. This can take anywhere from several minutes to several days.'
          )}
        </Text>
        <Text style={firstRunStyle.spacedParagraph}>
          {__('If you continue to see this message, please request to be verified on the')}{' '}
          <Link
            style={rewardStyle.underlinedTextLink}
            href="https://discordapp.com/invite/Z3bERWA"
            text={__('LBRY Discord server')}
          />
          .
        </Text>
        <Text style={firstRunStyle.spacedParagraph}>{__('Please enjoy free content in the meantime!')}</Text>
      </View>
    );
  }
}

export default ManualVerifyPage;
