import React from 'react';
import { Lbry, doPreferenceGet } from 'lbry-redux';
import { ActivityIndicator, Linking, NativeModules, Text, TouchableOpacity, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import EmailVerifyPage from './internal/email-verify-page';
import ManualVerifyPage from './internal/manual-verify-page';
import PhoneVerifyPage from './internal/phone-verify-page';
import SyncVerifyPage from './internal/sync-verify-page';
import firstRunStyle from 'styles/firstRun';

class VerificationScreen extends React.PureComponent {
  state = {
    currentPage: null,
    emailSubmitted: false,
    launchUrl: null,
    showSkip: false,
    skipAccountConfirmed: false,
    showBottomContainer: true,
    signInFlow: false,
    walletPassword: null,
    isEmailVerificationPhase: false,
    isEmailVerified: false,
    isIdentityVerified: false,
    isRewardApproved: false,
  };

  componentDidMount() {
    const { user, navigation } = this.props;
    const { signInFlow } = navigation.state.params;
    this.setState({ signInFlow });
    this.checkVerificationStatus(user);
    NativeModules.Firebase.setCurrentScreen('Verification');
  }

  setEmailVerificationPhase = value => {
    this.setState({ isEmailVerificationPhase: value });
  };

  getUserSettings = () => {
    const { populateSharedUserState } = this.props;

    doPreferenceGet(
      'shared',
      preference => {
        populateSharedUserState(preference);
      },
      error => {
        /* failed */
      }
    );
  };

  checkVerificationStatus = user => {
    const { deviceWalletSynced, getSync, navigation } = this.props;
    const { syncFlow } = navigation.state.params;

    this.setState(
      {
        isEmailVerified: user && user.primary_email && user.has_verified_email,
        isIdentityVerified: user && user.is_identity_verified,
        isRewardApproved: user && user.is_reward_approved,
      },
      () => {
        if (!this.state.isEmailVerified) {
          this.setState({ currentPage: 'emailVerify' });
        }

        if (syncFlow) {
          if (this.state.isEmailVerified && !deviceWalletSynced) {
            this.setState({ currentPage: 'syncVerify' });
          }

          if (this.state.isEmailVerified && syncFlow && deviceWalletSynced) {
            // retrieve user settings
            NativeModules.UtilityModule.getSecureValue(Constants.KEY_WALLET_PASSWORD).then(walletPassword => {
              getSync(walletPassword, () => {
                this.getUserSettings();
                navigation.goBack();
              });
            });
          }
        } else {
          if (this.state.isEmailVerified && !this.state.isIdentityVerified && !this.state.isRewardApproved) {
            this.setState({ currentPage: 'phoneVerify' });
          }
          if (this.state.isEmailVerified && this.state.isIdentityVerified && !this.state.isRewardApproved) {
            this.setState({ currentPage: 'manualVerify' });
          }
          if (this.state.isEmailVerified && this.state.isRewardApproved) {
            // verification steps already completed
            // simply navigate back to the rewards page
            if (user.primary_email) {
              NativeModules.Firebase.track('reward_eligibility_completed', { email: user.primary_email });
            }
            navigation.goBack();
          }
        }
      }
    );
  };

  componentWillReceiveProps(nextProps) {
    const { user } = nextProps;
    this.checkVerificationStatus(user);
  }

  onCloseButtonPressed = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const {
      addUserEmail,
      checkSync,
      emailNewErrorMessage,
      emailAlreadyExists,
      emailNewPending,
      emailToVerify,
      getSync,
      navigation,
      notify,
      addUserPhone,
      getSyncIsPending,
      hasSyncedWallet,
      setSyncIsPending,
      syncApplyIsPending,
      syncApplyErrorMessage,
      syncApply,
      syncData,
      syncHash,
      phone,
      phoneVerifyIsPending,
      phoneVerifyErrorMessage,
      phoneNewIsPending,
      phoneNewErrorMessage,
      resendVerificationEmail,
      setClientSetting,
      verifyPhone,
    } = this.props;

    let page = null;
    switch (this.state.currentPage) {
      case 'emailVerify':
        page = (
          <EmailVerifyPage
            addUserEmail={addUserEmail}
            emailAlreadyExists={emailAlreadyExists}
            emailNewErrorMessage={emailNewErrorMessage}
            emailNewPending={emailNewPending}
            emailToVerify={emailToVerify}
            notify={notify}
            setEmailVerificationPhase={this.setEmailVerificationPhase}
            resendVerificationEmail={resendVerificationEmail}
          />
        );
        break;

      case 'phoneVerify':
        page = (
          <PhoneVerifyPage
            addUserPhone={addUserPhone}
            phone={phone}
            phoneVerifyIsPending={phoneVerifyIsPending}
            phoneVerifyErrorMessage={phoneVerifyErrorMessage}
            phoneNewIsPending={phoneNewIsPending}
            phoneNewErrorMessage={phoneNewErrorMessage}
            setEmailVerificationPhase={this.setEmailVerificationPhase}
            notify={notify}
            verifyPhone={verifyPhone}
          />
        );
        break;

      case 'syncVerify':
        page = (
          <SyncVerifyPage
            checkSync={checkSync}
            getSync={getSync}
            getSyncIsPending={getSyncIsPending}
            hasSyncedWallet={hasSyncedWallet}
            navigation={navigation}
            notify={notify}
            setEmailVerificationPhase={this.setEmailVerificationPhase}
            setClientSetting={setClientSetting}
            setSyncIsPending={setSyncIsPending}
            syncApplyIsPending={syncApplyIsPending}
            syncApplyErrorMessage={syncApplyErrorMessage}
            syncApply={syncApply}
            syncData={syncData}
            syncHash={syncHash}
            signInFlow={this.state.signInFlow}
          />
        );
        break;

      case 'manualVerify':
        page = <ManualVerifyPage setEmailVerificationPhase={this.setEmailVerificationPhase} />;
        break;
    }

    return (
      <View style={firstRunStyle.screenContainer}>
        {page}

        {!this.state.isEmailVerificationPhase && (
          <TouchableOpacity style={firstRunStyle.closeButton} onPress={this.onCloseButtonPressed}>
            <Icon name={'times'} size={16} style={firstRunStyle.closeButtonIcon} />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

export default VerificationScreen;
