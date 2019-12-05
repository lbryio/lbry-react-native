import React from 'react';
import { Lbry } from 'lbry-redux';
import { ActivityIndicator, NativeModules, Platform, Text, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Link from 'component/link';
import firstRunStyle from 'styles/firstRun';

class WelcomePage extends React.PureComponent {
  static MAX_STATUS_TRIES = 60;

  state = {
    authenticationStarted: false,
    authenticationFailed: false,
    sdkStarted: false,
    statusTries: 0,
  };

  componentWillReceiveProps(nextProps) {
    const { authenticating, authToken } = this.props;

    if (this.state.authenticationStarted && !authenticating) {
      if (authToken === null) {
        this.setState({ authenticationFailed: true, authenticationStarted: false });
      } else {
        // first_user_auth because it's the first time
        AsyncStorage.getItem(Constants.KEY_FIRST_USER_AUTH).then(firstUserAuth => {
          if (firstUserAuth !== 'true') {
            // first_user_auth
            NativeModules.Firebase.track('first_user_auth', null);
            AsyncStorage.setItem(Constants.KEY_FIRST_USER_AUTH, 'true');
          }
        });
      }
    }
  }

  componentDidMount() {
    // call user/new
    const { generateAuthToken, authenticating, authToken } = this.props;
    if (!authenticating) {
      this.startAuthenticating();
    }
  }

  startAuthenticating = () => {
    this.setState({ authenticationStarted: true, authenticationFailed: false });
    NativeModules.VersionInfo.getAppVersion().then(appVersion => {
      NativeModules.Firebase.getMessagingToken()
        .then(firebaseToken => this.performAuthenticate(appVersion, firebaseToken))
        .catch(() => {
          this.performAuthenticate(appVersion); /* proceed without firebase */
        });
    });
  };

  performAuthenticate(appVersion, firebaseToken) {
    const { authenticate } = this.props;
    Lbry.status()
      .then(info => {
        this.setState({ sdkStarted: true });

        authenticate(appVersion, Platform.OS, firebaseToken);
      })
      .catch(error => {
        if (this.state.statusTries >= WelcomePage.MAX_STATUS_TRIES) {
          this.setState({ authenticationFailed: true });

          // sdk_start_failed
          NativeModules.Firebase.track('sdk_start_failed', null);
        } else {
          setTimeout(() => {
            this.startAuthenticating();
            this.setState({ statusTries: this.state.statusTries + 1 });
          }, 1000); // Retry every second for a maximum of MAX_STATUS_TRIES tries (60 seconds)
        }
      });
  }

  render() {
    const { authenticating, authToken, onWelcomePageLayout } = this.props;

    let content;
    if (this.state.authenticationFailed) {
      // Ask the user to try again
      content = (
        <View>
          <Text style={firstRunStyle.paragraph}>
            {__(
              'The LBRY servers were unreachable at this time. Please check your Internet connection and then restart the app to try again.'
            )}
          </Text>
        </View>
      );
    } else if (!authToken || authenticating) {
      content = (
        <View style={firstRunStyle.centered}>
          <ActivityIndicator size="large" color={Colors.White} style={firstRunStyle.waiting} />
          <Text style={firstRunStyle.paragraph}>{__('Please wait while we get some things ready...')}</Text>
        </View>
      );
    } else {
      content = (
        <View onLayout={onWelcomePageLayout}>
          <Text style={firstRunStyle.title}>Welcome to LBRY.</Text>
          <Text style={firstRunStyle.paragraph}>
            {__(
              'LBRY is a community-controlled content platform where you can find and publish videos, music, books, and more.'
            )}
          </Text>
          <Text style={[firstRunStyle.infoParagraph, firstRunStyle.tosParagraph]}>
            By continuing, I agree to the{' '}
            <Link style={firstRunStyle.tosLink} text={'Terms of Service'} href={'https://lbry.com/termsofservice'} />{' '}
            and confirm I am over the age of 13.
          </Text>
        </View>
      );
    }

    return <View style={firstRunStyle.container}>{content}</View>;
  }
}

export default WelcomePage;
