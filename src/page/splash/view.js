import React from 'react';
import { Lbry, doPreferenceGet, isURIValid } from 'lbry-redux';
import { Lbryio } from 'lbryinc';
import { ActivityIndicator, DeviceEventEmitter, Linking, NativeModules, Platform, Text, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { decode as atob } from 'base-64';
import { navigateToUri, transformUrl } from 'utils/helper';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import Button from 'component/button';
import ProgressBar from 'component/progressBar';
import PropTypes from 'prop-types';
import Colors from 'styles/colors';
import Constants, { DrawerRoutes, InnerDrawerRoutes } from 'constants'; // eslint-disable-line node/no-deprecated-api
import splashStyle from 'styles/splash';
import RNFS from 'react-native-fs';

const BLOCK_HEIGHT_INTERVAL = 1000 * 60 * 2.5; // every 2.5 minutes

class SplashScreen extends React.PureComponent {
  static navigationOptions = {
    title: 'Splash',
  };

  state = {
    authWithoutSdk: false,
    accountUnlockFailed: false,
    appVersion: null,
    daemonReady: false,
    details: __('Starting up'),
    firebaseToken: null,
    message: __('Connecting'),
    isRunning: false,
    isLagging: false,
    launchUrl: null,
    isDownloadingHeaders: false,
    headersDownloadProgress: 0,
    shouldAuthenticate: false,
    subscriptionsFetched: false,
    liteMode: false,
    liteModeParams: {},
  };

  initLiteMode = () => {
    NativeModules.UtilityModule.getLbrynetDirectory().then(path => {
      NativeModules.UtilityModule.getPlatform().then(platform => {
        RNFS.readFile(`${path}/install_id`, 'utf8')
          .then(installIdContent => {
            // node_id is actually optional (won't be present if dht is disabled)
            // RNFS.readFile(`${path}/node_id`, 'utf8').then(nodeIdContent => {
            // TODO: Load proper lbrynetVersion value
            this.setState(
              {
                liteModeParams: {
                  installationId: installIdContent,
                  nodeId: null,
                  lbrynetVersion: '0.64.0',
                  platform,
                },
              },
              () => this.updateStatus(),
            );
            // }).catch((err) => { console.log(err); console.log('node_id not found.'); this.lbryConnect() });
          })
          .catch(() => this.lbryConnect());
      });
    });
  };

  authenticateWithoutSdk() {
    const { authenticate } = this.props;
    NativeModules.VersionInfo.getAppVersion().then(appVersion => {
      this.setState({ appVersion, shouldAuthenticate: true, authWithoutSdk: true });
      NativeModules.Firebase.getMessagingToken()
        .then(firebaseToken => {
          this.setState({ firebaseToken }, () => authenticate(appVersion, Platform.OS, firebaseToken, false));
        })
        .catch(() => {
          authenticate(appVersion, Platform.OS, null, false);
        });
    });
  }

  updateStatus() {
    const { liteMode } = this.state;

    // authenticate immediately
    if (!NativeModules.UtilityModule.dhtEnabled) {
      this.authenticateWithoutSdk();
    }
  }

  navigateToMain = () => {
    const { lastRouteInStack, navigation, notify, verifyUserEmail, verifyUserEmailFailure } = this.props;
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Main' })],
    });
    navigation.dispatch(resetAction);

    const launchUrl =
      navigation.state.params && navigation.state.params.launchUrl
        ? navigation.state.params.launchUrl
        : this.state.launchUrl;
    if (launchUrl) {
      navigateToUri(navigation, transformUrl(launchUrl));
    } else if (lastRouteInStack) {
      // no launch url, check if there's a last route in stack to navigate to.
      const { route, params } = lastRouteInStack;
      if (route) {
        if (DrawerRoutes.includes(route)) {
          navigation.navigate({ routeName: route, params });
        } else if (!InnerDrawerRoutes.includes(route) && isURIValid(route)) {
          navigateToUri(navigation, route);
        }
      }
    }

    // splash screen is done at this point, next page to be displayed will be user-interactable
    NativeModules.Firebase.logLaunchTiming();
  };

  componentWillReceiveProps(nextProps) {
    const { getSync, installNewWithParams } = this.props;
    const {
      daemonReady,
      authWithoutSdk,
      shouldAuthenticate,
      liteMode,
      liteModeParams,
      appVersion,
      firebaseToken,
    } = this.state;
    const { user } = nextProps;

    if (liteMode && user && user.id) {
      this.navigateToLiteMode();
    } else if (shouldAuthenticate && user && user.id) {
      if (daemonReady || authWithoutSdk) {
        this.setState({ shouldAuthenticate: false }, () => {
          // call install new after successful authentication
          if (authWithoutSdk) {
            const { installationId, nodeId, lbrynetVersion, platform } = liteModeParams;
            installNewWithParams(
              appVersion,
              installationId,
              nodeId,
              lbrynetVersion,
              Platform.OS,
              platform,
              firebaseToken,
            );
          }

          // user is authenticated, navigate to the main view
          if (user.has_verified_email) {
            NativeModules.UtilityModule.getSecureValue(Constants.KEY_WALLET_PASSWORD).then(walletPassword => {
              getSync(walletPassword, () => {
                this.getUserSettings();
              });
            });
            this.navigateToMain();
            return;
          }

          this.navigateToMain();
        });
      }
    }
  }

  navigateToLiteMode = () => {
    const { navigation } = this.props;
    const { launchUrl } = this.state;
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: Constants.DRAWER_ROUTE_LITE_FILE,
          params: { uri: launchUrl },
        }),
      ],
    });
    navigation.dispatch(resetAction);
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
      },
    );
  };

  onNotificationTargetLaunch = evt => {
    if (evt.url && evt.url.startsWith('lbry://')) {
      this.setState({ launchUrl: evt.url });
    }
  };

  finishSplashScreen = () => {
    const { authenticate, getSync, user } = this.props;

    // Leave the splash screen
    if (user && user.id && user.has_verified_email) {
      // user already authenticated
      NativeModules.UtilityModule.getSecureValue(Constants.KEY_WALLET_PASSWORD).then(walletPassword => {
        getSync(walletPassword, () => {
          this.getUserSettings();
        });
      });
      this.navigateToMain();
    } else {
      NativeModules.VersionInfo.getAppVersion().then(appVersion => {
        this.setState({ shouldAuthenticate: true }, () => {
          NativeModules.Firebase.getMessagingToken()
            .then(firebaseToken => {
              authenticate(appVersion, Platform.OS, firebaseToken, true);
            })
            .catch(() => authenticate(appVersion, Platform.OS, null, true));
        });
      });
    }
  };

  handleAccountUnlockFailed() {
    this.setState({ accountUnlockFailed: true });
  }

  handleSdkReady = () => {
    this.setState({ daemonReady: true }, () => {
      Lbry.wallet_status().then(secureWalletStatus => {
        // For now, automatically unlock the wallet if a password is set so that downloads work
        NativeModules.UtilityModule.getSecureValue(Constants.KEY_WALLET_PASSWORD).then(password => {
          if ((secureWalletStatus.is_encrypted && !secureWalletStatus.is_locked) || secureWalletStatus.is_locked) {
            this.setState({
              message: __('Unlocking account'),
              details: __('Decrypting wallet'),
            });

            // unlock the wallet and then finish the splash screen
            Lbry.wallet_unlock({ password: password || '' }).then(unlocked => {
              if (unlocked) {
                this.setState({
                  message: __('Authenticating'),
                  details: __('Waiting for authentication'),
                });
                this.finishSplashScreen();
              } else {
                this.handleAccountUnlockFailed();
              }
            });
          } else {
            this.setState({
              message: __('Authenticating'),
              details: __('Waiting for authentication'),
            });
            this.finishSplashScreen();
          }
        });
      });
    });
  };

  handleSdkStatusResponse = evt => {
    const { status } = evt;
    const walletStatus = status.wallet;

    const headerSyncProgress = walletStatus ? walletStatus.headers_synchronization_progress : null;
    if (headerSyncProgress && headerSyncProgress < 100) {
      this.setState({
        isDownloadingHeaders: true,
        headersDownloadProgress: headerSyncProgress,
      });
    } else {
      // set downloading flag to false if blockchain_headers isn't in the status response
      this.setState({
        isDownloadingHeaders: false,
      });
    }

    if (headerSyncProgress < 100) {
      const downloadProgress = isNaN(parseInt(headerSyncProgress, 10)) ? '0' : headerSyncProgress || '0';
      this.setState({
        message: __('Blockchain Sync'),
        details: __('Catching up with the blockchain (%progress%%)', { progress: downloadProgress }),
      });
    } else if (walletStatus && walletStatus.blocks_behind > 0) {
      const behind = walletStatus.blocks_behind;
      const behindText =
        behind === 1 ? __('%num% block behind', { num: behind }) : __('%num% blocks behind', { num: behind });
      this.setState({
        message: __('Blockchain Sync'),
        details: behindText,
      });
    } else {
      this.setState({
        message: __('Network Loading'),
        details: __('Initializing LBRY service'),
      });
    }
  };

  componentWillMount() {
    DeviceEventEmitter.addListener('onNotificationTargetLaunch', this.onNotificationTargetLaunch);
    DeviceEventEmitter.addListener('onSdkReady', this.handleSdkReady);
    DeviceEventEmitter.addListener('onSdkStatusResponse', this.handleSdkStatusResponse);
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('onNotificationTargetLaunch', this.onNotificationTargetLaunch);
    DeviceEventEmitter.removeListener('onSdkReady', this.handleSdkReady);
    DeviceEventEmitter.removeListener('onSdkStatusResponse', this.handleSdkStatusResponse);
  }

  componentDidMount() {
    NativeModules.Firebase.track('app_launch', null);
    NativeModules.Firebase.setCurrentScreen('Splash');
    NativeModules.UtilityModule.checkSdkReady();

    const { navigation } = this.props;
    const { resetUrl } = navigation.state.params;
    const isResetUrlSet = !!resetUrl;

    this.props.fetchRewardedContent();
    Linking.getInitialURL().then(url => {
      let liteMode;
      if (url) {
        liteMode = !isResetUrlSet && url.indexOf('liteMode=1') > -1;
        this.setState({ launchUrl: resetUrl || url, liteMode });
      }

      NativeModules.UtilityModule.getNotificationLaunchTarget().then(target => {
        if (target) {
          liteMode = !isResetUrlSet && target.indexOf('liteMode=1') > -1;
          this.setState({ launchUrl: resetUrl || target, liteMode });
        }

        // Only connect after checking initial launch url / notification launch target
        this.initLiteMode();
      });
    });

    // Start measuring the first launch time from the splash screen
    // (time to first user interaction - after first run completed)
    AsyncStorage.getItem('hasLaunched').then(value => {
      if (value !== 'true') {
        AsyncStorage.setItem('hasLaunched', 'true');
        // only set firstLaunchTime since we've determined that this is the first app launch ever
        AsyncStorage.setItem('firstLaunchTime', String(moment().unix()));
      }
    });
  }

  lbryConnect = () => {
    if (NativeModules.UtilityModule.dhtEnabled) {
      Lbry.connect()
        .then(() => {
          this.updateStatus();
        })
        .catch(e => {
          this.setState({
            isLagging: true,
            message: __('Connection Failure'),
            details: __(
              'We could not establish a connection to the SDK. Your data connection may be preventing LBRY from connecting. Contact hello@lbry.com if you think this is a software bug.',
            ),
          });
        });
    } else {
      this.updateStatus(); // skip lbry.connect for now (unless dht flag is enabled)
    }
  };

  handleContinueAnywayPressed = () => {
    this.setState(
      {
        accountUnlockFailed: false,
        message: __('Authenticating'),
        details: __('Waiting for authentication'),
      },
      () => this.finishSplashScreen(),
    );
  };

  render() {
    const { accountUnlockFailed, message, details, isLagging, isRunning } = this.state;

    if (accountUnlockFailed) {
      return (
        <View style={splashStyle.container}>
          <Text style={splashStyle.errorTitle}>{__('Oops! Something went wrong.')}</Text>
          <Text style={splashStyle.paragraph}>
            {__(
              'Your wallet failed to unlock, which means you may not be able to play any videos or access your funds.',
            )}
          </Text>
          <Text style={splashStyle.paragraph}>
            {__(
              'You can try to fix this by tapping Stop on the LBRY service notification and starting the app again. If the problem continues, you may have to reinstall the app and restore your account.',
            )}
          </Text>

          <Button
            style={splashStyle.continueButton}
            theme={'light'}
            text={__('Continue anyway')}
            onPress={this.handleContinueAnywayPressed}
          />
        </View>
      );
    }

    return (
      <View style={splashStyle.container}>
        <Text style={splashStyle.title}>LBRY</Text>
        {this.state.isDownloadingHeaders && (
          <ProgressBar
            color={Colors.White}
            style={splashStyle.progress}
            progress={this.state.headersDownloadProgress}
          />
        )}
        {!this.state.isDownloadingHeaders && (
          <ActivityIndicator color={Colors.White} style={splashStyle.loading} size={'small'} />
        )}
        <Text style={splashStyle.message}>{message}</Text>
        <Text style={splashStyle.details}>{details}</Text>
      </View>
    );
  }
}

export default SplashScreen;
