import React from 'react';
import { Lbry } from 'lbry-redux';
import { ActivityIndicator, NativeModules, View, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Button from 'component/button';
import Link from 'component/link';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import firstRunStyle from 'styles/firstRun';
import rewardStyle from 'styles/reward';

class EmailVerifyPage extends React.PureComponent {
  state = {
    email: null,
    phase: Constants.PHASE_COLLECTION,
    placeholder: 'you@example.com',
    verifyStarted: false,
    previousEmail: null,
  };

  componentDidMount() {
    const { setEmailVerificationPhase } = this.props;
    if (setEmailVerificationPhase) {
      setEmailVerificationPhase(false);
    }
  }

  componentWillUmount() {
    AsyncStorage.removeItem(Constants.KEY_EMAIL_VERIFY_PENDING);
    AsyncStorage.removeItem(Constants.KEY_FIRST_RUN_EMAIL);
  }

  handleChangeText = text => {
    this.setState({ email: text });
    AsyncStorage.setItem(Constants.KEY_FIRST_RUN_EMAIL, text);
  };

  componentWillReceiveProps(nextProps) {
    const { emailNewErrorMessage, emailNewPending, emailToVerify } = nextProps;
    const { notify, setEmailVerificationPhase } = this.props;

    if (this.state.verifyStarted && !emailNewPending) {
      if (emailNewErrorMessage) {
        notify({ message: String(emailNewErrorMessage), isError: true });
        this.setState({ verifyStarted: false });
      } else {
        NativeModules.Firebase.track('email_added', { email: this.state.email });
        this.setState({ phase: Constants.PHASE_VERIFICATION });
        if (setEmailVerificationPhase) {
          setEmailVerificationPhase(true);
        }
        // notify({ message: 'Please follow the instructions in the email sent to your address to continue.' });
        AsyncStorage.setItem(Constants.KEY_EMAIL_VERIFY_PENDING, 'true');
      }
    }
  }

  onSendVerificationPressed = () => {
    const { addUserEmail, emailNewPending, notify, resendVerificationEmail, setEmailVerificationPhase } = this.props;

    if (emailNewPending) {
      return;
    }

    const { email } = this.state;
    if (!email || email.trim().length === 0 || email.indexOf('@') === -1) {
      return notify({
        message: 'Please provide a valid email address to continue.',
      });
    }

    if (this.state.previousEmail === this.state.email) {
      // resend
      resendVerificationEmail(this.state.email);
      AsyncStorage.setItem(Constants.KEY_EMAIL_VERIFY_PENDING, 'true');
      this.setState({ verifyStarted: true, phase: Constants.PHASE_VERIFICATION });
      if (setEmailVerificationPhase) {
        setEmailVerificationPhase(true);
      }
      return;
    }

    this.setState({ verifyStarted: true });
    addUserEmail(email);
  };

  onResendPressed = () => {
    const { resendVerificationEmail, notify } = this.props;
    // resend verification email if there was one previously set (and it wasn't changed)
    resendVerificationEmail(this.state.email);
    AsyncStorage.setItem(Constants.KEY_EMAIL_VERIFY_PENDING, 'true');
    notify({ message: 'Please follow the instructions in the email sent to your address to continue.' });
  };

  onEditPressed = () => {
    const { setEmailVerificationPhase } = this.props;
    this.setState({ verifyStarted: false, phase: Constants.PHASE_COLLECTION, previousEmail: this.state.email }, () => {
      if (setEmailVerificationPhase) {
        setEmailVerificationPhase(false);
      }
      // clear the previous email
      AsyncStorage.removeItem(Constants.KEY_EMAIL_VERIFY_PENDING);
      AsyncStorage.removeItem(Constants.KEY_FIRST_RUN_EMAIL);
    });
  };

  render() {
    const { emailNewPending } = this.props;

    return (
      <View style={firstRunStyle.container}>
        <Text style={rewardStyle.verificationTitle}>
          {Constants.PHASE_COLLECTION === this.state.phase ? 'Email' : 'Verify Email'}
        </Text>
        {Constants.PHASE_COLLECTION === this.state.phase && (
          <View>
            <Text style={firstRunStyle.paragraph}>Please provide an email address.</Text>
            <TextInput
              style={firstRunStyle.emailInput}
              placeholder={this.state.placeholder}
              underlineColorAndroid="transparent"
              selectionColor={Colors.NextLbryGreen}
              value={this.state.email}
              onChangeText={text => this.handleChangeText(text)}
              onFocus={() => {
                if (!this.state.email || this.state.email.length === 0) {
                  this.setState({ placeholder: '' });
                }
              }}
              onBlur={() => {
                if (!this.state.email || this.state.email.length === 0) {
                  this.setState({ placeholder: 'you@example.com' });
                }
              }}
            />
            <View style={rewardStyle.buttonContainer}>
              {!this.state.verifyStarted && (
                <Button
                  style={rewardStyle.verificationButton}
                  theme={'light'}
                  text={'Send verification email'}
                  onPress={this.onSendVerificationPressed}
                />
              )}
              {this.state.verifyStarted && emailNewPending && (
                <View style={firstRunStyle.centerInside}>
                  <ActivityIndicator size={'small'} color={Colors.White} />
                </View>
              )}
            </View>
          </View>
        )}

        {Constants.PHASE_VERIFICATION === this.state.phase && (
          <View>
            <Text style={firstRunStyle.paragraph}>
              An email has been sent to <Text style={firstRunStyle.nowrap}>{this.state.email}</Text>. Please follow the
              instructions in the message to verify your email address.
            </Text>

            <View style={rewardStyle.buttonContainer}>
              <Button
                style={rewardStyle.verificationButton}
                theme={'light'}
                text={'Resend'}
                onPress={this.onResendPressed}
              />
              <Link style={rewardStyle.verificationLink} text={'Edit'} onPress={this.onEditPressed} />
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default EmailVerifyPage;
