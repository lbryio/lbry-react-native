// @flow
import React from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeModules,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import CountryPicker from 'react-native-country-picker-modal';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import PhoneInput from 'react-native-phone-input';
import firstRunStyle from 'styles/firstRun';
import rewardStyle from 'styles/reward';

class PhoneVerifyPage extends React.PureComponent {
  phoneInput = null;

  picker = null;

  constructor(props) {
    super(props);
    this.state = {
      canReceiveSms: false,
      cca2: 'US',
      codeVerifyStarted: false,
      codeVerifySuccessful: false,
      countryCode: null,
      countryPickerVisible: false,
      newPhoneAdded: false,
      number: null,
      phoneVerifyFailed: false,
      verificationCode: null,
      phase: Constants.PHASE_COLLECTION,
    };
  }

  componentDidMount() {
    const { phone, setEmailVerificationPhase } = this.props;
    if (phone && String(phone).trim().length > 0) {
      this.setState({ newPhoneAdded: true, phase: Constants.PHASE_VERIFICATION });
    }
    if (setEmailVerificationPhase) {
      setEmailVerificationPhase(false);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      phoneVerifyIsPending,
      phoneVerifyErrorMessage,
      notify,
      phoneNewErrorMessage,
      phoneNewIsPending,
      onPhoneVerifySuccessful,
    } = this.props;

    if (!phoneNewIsPending && phoneNewIsPending !== prevProps.phoneNewIsPending) {
      if (phoneNewErrorMessage) {
        notify({ message: String(phoneNewErrorMessage) });
        this.setState({ phoneVerifyFailed: true });
      } else {
        this.setState({ newPhoneAdded: true, phase: Constants.PHASE_VERIFICATION, phoneVerifyFailed: false });
      }
    }
    if (!phoneVerifyIsPending && phoneVerifyIsPending !== prevProps.phoneVerifyIsPending) {
      if (phoneVerifyErrorMessage) {
        notify({ message: String(phoneVerifyErrorMessage) });
        this.setState({ codeVerifyStarted: false, phoneVerifyFailed: true });
      } else {
        notify({ message: __('Your phone number was successfully verified.') });
        this.setState({ codeVerifySuccessful: true, phoneVerifyFailed: false });
        if (onPhoneVerifySuccessful) {
          onPhoneVerifySuccessful();
        }
      }
    }
  }

  onEditPressed = () => {
    this.setState({ newPhoneAdded: false, phase: Constants.PHASE_COLLECTION, phoneVerifyFailed: false });
  };

  receiveVerificationCode = evt => {
    if (!this.state.newPhoneAdded || this.state.codeVerifySuccessful) {
      return;
    }

    const { verifyPhone } = this.props;
    this.setState({ codeVerifyStarted: true });
    verifyPhone(evt.code);
  };

  onSendTextPressed = () => {
    const { addUserPhone, notify } = this.props;

    if (!this.phoneInput.isValidNumber()) {
      return notify({
        message: __('Please provide a valid telephone number.'),
      });
    }

    this.setState({ phoneVerifyFailed: false });
    const countryCode = this.phoneInput.getCountryCode();
    const number = this.phoneInput.getValue().replace('+' + countryCode, '');
    this.setState({ countryCode, number });
    addUserPhone(number, countryCode);
  };

  onVerifyPressed = () => {
    if (this.state.codeVerifyStarted) {
      return;
    }

    const { verifyPhone } = this.props;
    this.setState({ codeVerifyStarted: true, phoneVerifyFailed: false });
    verifyPhone(this.state.verificationCode);
  };

  onPressFlag = () => {
    console.log('setting country picker visible...');
    this.setState({ countryPickerVisible: true });
  };

  selectCountry = country => {
    this.phoneInput.selectCountry(country.cca2.toLowerCase());
    this.setState({ cca2: country.cca2, countryPickerVisible: false }, () => {
      this.phoneInput.focus();
    });
  };

  handleChangeText = text => {
    this.setState({ verificationCode: text });
  };

  render() {
    const { phoneVerifyIsPending, phoneVerifyErrorMessage, phone, phoneErrorMessage, phoneNewIsPending } = this.props;

    return (
      <View style={firstRunStyle.container}>
        <Text style={rewardStyle.verificationTitle}>
          {this.state.phase === Constants.PHASE_VERIFICATION ? __('Verify Phone Number') : __('Phone Number')}
        </Text>

        <View style={rewardStyle.phoneVerificationContainer}>
          {this.state.phase === Constants.PHASE_COLLECTION && (
            <View>
              <Text style={[rewardStyle.bottomMarginMedium, firstRunStyle.paragraph]}>
                {__('Please provide a phone number to prevent fraud.')}
              </Text>
              <PhoneInput
                ref={ref => {
                  this.phoneInput = ref;
                }}
                style={StyleSheet.flatten(rewardStyle.phoneInput)}
                textProps={{ placeholder: '(phone number)' }}
                textStyle={StyleSheet.flatten(rewardStyle.phoneInputText)}
                onPressFlag={this.onPressFlag}
              />

              <View style={rewardStyle.buttonContainer}>
                {!phoneNewIsPending && (
                  <Button
                    style={[rewardStyle.verificationButton, rewardStyle.topMarginMedium]}
                    theme={'light'}
                    text={__('Send verification text')}
                    onPress={this.onSendTextPressed}
                  />
                )}
                {phoneNewIsPending && (
                  <View style={firstRunStyle.centerInside}>
                    <ActivityIndicator style={rewardStyle.topMarginMedium} size="small" color={Colors.White} />
                  </View>
                )}
              </View>
            </View>
          )}

          {this.state.phase === Constants.PHASE_VERIFICATION && (
            <View>
              {!phoneVerifyIsPending && !this.codeVerifyStarted && (
                <View>
                  <Text style={[rewardStyle.bottomMarginSmall, firstRunStyle.paragraph]}>
                    {__('Please enter the verification code sent to %phone%', { phone })}.
                  </Text>
                  <TextInput
                    style={rewardStyle.verificationCodeInput}
                    keyboardType="numeric"
                    placeholder="0000"
                    underlineColorAndroid="transparent"
                    selectionColor={Colors.NextLbryGreen}
                    value={this.state.verificationCode}
                    onChangeText={text => this.handleChangeText(text)}
                  />
                  <View style={rewardStyle.buttonContainer}>
                    <Button
                      style={[rewardStyle.verificationButton, rewardStyle.topMarginSmall]}
                      theme={'light'}
                      text={__('Verify')}
                      onPress={this.onVerifyPressed}
                    />
                    <Link style={rewardStyle.verificationLink} text={__('Edit')} onPress={this.onEditPressed} />
                  </View>
                </View>
              )}
              {phoneVerifyIsPending && (
                <View style={firstRunStyle.centered}>
                  <Text style={firstRunStyle.paragraph}>{__('Verifying your phone number...')}</Text>
                  <ActivityIndicator
                    color={Colors.White}
                    size="small"
                    style={[rewardStyle.topMarginMedium, rewardStyle.leftRightMargin]}
                  />
                </View>
              )}
            </View>
          )}
          {this.state.phoneVerifyFailed && (
            <View style={rewardStyle.failureFootnote}>
              <Text style={rewardStyle.paragraphText}>
                Sorry, we were unable to verify your phone number. Please go to{' '}
                <Link style={rewardStyle.textLink} href="http://chat.lbry.com" text="chat.lbry.com" /> for manual
                verification if this keeps happening.
              </Text>
            </View>
          )}
        </View>

        <CountryPicker
          countryCode={this.state.cca2}
          withAlphaFilter
          withFilter
          withFlag
          withFlagButton={false}
          withCallingCode
          withModal
          onSelect={this.selectCountry}
          translation="eng"
          modalProps={{ visible: this.state.countryPickerVisible }}
        />
      </View>
    );
  }
}

export default PhoneVerifyPage;
