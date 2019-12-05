import React from 'react';
import { Lbry } from 'lbry-redux';
import { ActivityIndicator, Linking, NativeModules, Platform, Switch, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import firstRunStyle from 'styles/firstRun';

class EmailVerifyPage extends React.PureComponent {
  onResendPressed = () => {
    const { email, notify, resendVerificationEmail } = this.props;
    resendVerificationEmail(email);
    AsyncStorage.setItem(Constants.KEY_EMAIL_VERIFY_PENDING, 'true');
    notify({ message: __('Please follow the instructions in the email sent to your address to continue.') });
  };

  render() {
    const { onEmailViewLayout, email, emailAlreadyExists } = this.props;

    const content = (
      <View onLayout={() => onEmailViewLayout('verify')}>
        <Text style={firstRunStyle.title}>{emailAlreadyExists ? __('Sign In') : __('Verify Email')}</Text>

        <Text style={firstRunStyle.paragraph}>
          {__('An email has been sent to')}
          {'\n\n'}
          {email}
          {'\n\n'}
          {emailAlreadyExists && __('Please click the link in the message to complete signing in')}
          {!emailAlreadyExists && __('Please click the link in the message to verify your email address')}.
        </Text>

        <View style={firstRunStyle.buttonContainer}>
          <Button
            style={firstRunStyle.verificationButton}
            theme={'light'}
            text={__('Resend')}
            onPress={this.onResendPressed}
          />
        </View>
      </View>
    );

    return <View style={firstRunStyle.container}>{content}</View>;
  }
}

export default EmailVerifyPage;
