import React from 'react';
import AboutPage from 'page/about';
import ChannelCreatorPage from 'page/channelCreator';
import DiscoverPage from 'page/discover';
import DownloadsPage from 'page/downloads';
import DrawerContent from 'component/drawerContent';
import FilePage from 'page/file';
import LiteFilePage from 'page/liteFile';
import FirstRunScreen from 'page/firstRun';
import InvitesPage from 'page/invites';
import PublishPage from 'page/publish';
import PublishesPage from 'page/publishes';
import RewardsPage from 'page/rewards';
import TagPage from 'page/tag';
import TrendingPage from 'page/trending';
import SearchPage from 'page/search';
import SettingsPage from 'page/settings';
import SplashScreen from 'page/splash';
import SubscriptionsPage from 'page/subscriptions';
import TransactionHistoryPage from 'page/transactionHistory';
import VerificationScreen from 'page/verification';
import WalletPage from 'page/wallet';
import { NavigationActions } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import {
  createReduxContainer,
  createReactNavigationReduxMiddleware,
  createNavigationReducer,
} from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';
import {
  AppState,
  BackHandler,
  DeviceEventEmitter,
  Linking,
  NativeModules,
  StatusBar,
  TextInput,
  ToastAndroid,
} from 'react-native';
import { selectDrawerStack } from 'redux/selectors/drawer';
import {
  ACTIONS,
  SETTINGS,
  doDismissToast,
  doPopulateSharedUserState,
  doPreferenceGet,
  doToast,
  selectToast,
} from 'lbry-redux';
import {
  Lbryio,
  doGetSync,
  doUserCheckEmailVerified,
  doUserEmailVerify,
  doUserEmailVerifyFailure,
  selectEmailToVerify,
  selectEmailVerifyIsPending,
  selectEmailVerifyErrorMessage,
  selectHashChanged,
  selectUser,
} from 'lbryinc';
import { doStartDownload, doUpdateDownload, doCompleteDownload } from 'redux/actions/file';
import { makeSelectClientSetting, selectFullscreenMode } from 'redux/selectors/settings';
import { decode as atob } from 'base-64';
import { dispatchNavigateBack, dispatchNavigateToUri, transformUrl } from 'utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import NavigationButton from 'component/navigationButton';
import discoverStyle from 'styles/discover';
import searchStyle from 'styles/search';
import SearchRightHeaderIcon from 'component/searchRightHeaderIcon';
import Snackbar from 'react-native-snackbar';

const SYNC_GET_INTERVAL = 1000 * 60 * 5; // every 5 minutes

const menuNavigationButton = navigation => (
  <NavigationButton
    name="bars"
    size={24}
    style={discoverStyle.drawerMenuButton}
    iconStyle={discoverStyle.drawerHamburger}
    onPress={() => navigation.openDrawer()}
  />
);

const discoverStack = createStackNavigator(
  {
    Subscriptions: {
      screen: SubscriptionsPage,
      navigationOptions: {
        title: 'Following',
        header: null,
        drawerIcon: ({ tintColor }) => <Icon name="heart" solid size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    File: {
      screen: FilePage,
      navigationOptions: ({ navigation }) => ({
        header: null,
      }),
    },
    Tag: {
      screen: TagPage,
      navigationOptions: ({ navigation }) => ({
        header: null,
      }),
    },
    Search: {
      screen: SearchPage,
      navigationOptions: ({ navigation }) => ({
        header: null,
      }),
    },
  },
  {
    headerMode: 'screen',
    transitionConfig: () => ({ screenInterpolator: () => null }),
  },
);

discoverStack.navigationOptions = ({ navigation }) => {
  let drawerLockMode = 'unlocked';
  /* if (navigation.state.index > 0) {
    drawerLockMode = 'locked-closed';
  } */

  return {
    drawerLockMode,
  };
};

const walletStack = createStackNavigator(
  {
    Wallet: {
      screen: WalletPage,
      navigationOptions: ({ navigation }) => ({
        title: 'Wallet',
        header: null,
      }),
    },
    TransactionHistory: {
      screen: TransactionHistoryPage,
      navigationOptions: {
        title: 'Transaction History',
        header: null,
      },
    },
  },
  {
    headerMode: 'screen',
    transitionConfig: () => ({ screenInterpolator: () => null }),
  },
);

const drawerIconSize = 18;
const drawer = createDrawerNavigator(
  {
    DiscoverStack: {
      screen: discoverStack,
      navigationOptions: {
        title: 'Following',
        drawerIcon: ({ tintColor }) => <Icon name="home" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    Discover: {
      screen: DiscoverPage,
      navigationOptions: ({ navigation }) => ({
        title: 'Your Tags',
        header: null,
      }),
    },
    Trending: {
      screen: TrendingPage,
      navigationOptions: {
        title: 'All Content',
        drawerIcon: ({ tintColor }) => <Icon name="fire" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    WalletStack: {
      screen: walletStack,
      navigationOptions: {
        title: 'Wallet',
        drawerIcon: ({ tintColor }) => <Icon name="wallet" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    ChannelCreator: {
      screen: ChannelCreatorPage,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => <Icon name="at" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    Publish: {
      screen: PublishPage,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => <Icon name="upload" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    Publishes: {
      screen: PublishesPage,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => (
          <Icon name="cloud-upload-alt" size={drawerIconSize} style={{ color: tintColor }} />
        ),
      },
    },
    Rewards: {
      screen: RewardsPage,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => <Icon name="award" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    Invites: {
      screen: InvitesPage,
      navigationOptions: {
        drawerIcon: ({ tintColor }) => <Icon name="user-friends" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    Downloads: {
      screen: DownloadsPage,
      navigationOptions: {
        title: 'Library',
        drawerIcon: ({ tintColor }) => <Icon name="download" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    Settings: {
      screen: SettingsPage,
      navigationOptions: {
        drawerLockMode: 'locked-closed',
        drawerIcon: ({ tintColor }) => <Icon name="cog" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
    About: {
      screen: AboutPage,
      navigationOptions: {
        drawerLockMode: 'locked-closed',
        drawerIcon: ({ tintColor }) => <Icon name="info" size={drawerIconSize} style={{ color: tintColor }} />,
      },
    },
  },
  {
    drawerWidth: 299,
    drawerBackgroundColor: 'transparent',
    headerMode: 'none',
    backBehavior: 'none',
    unmountInactiveRoutes: true,
    contentComponent: DrawerContent,
    overlayColor: 'rgba(0, 0, 0, 0.7)',
    contentOptions: {
      activeTintColor: Colors.LbryGreen,
      labelStyle: discoverStyle.menuText,
    },
  },
);

const mainStackNavigator = new createStackNavigator(
  {
    FirstRun: {
      screen: FirstRunScreen,
      navigationOptions: {
        drawerLockMode: 'locked-closed',
      },
    },
    Splash: {
      screen: SplashScreen,
      navigationOptions: {
        drawerLockMode: 'locked-closed',
      },
    },
    Main: {
      screen: drawer,
    },
    Verification: {
      screen: VerificationScreen,
      navigationOptions: {
        drawerLockMode: 'locked-closed',
      },
    },
    LiteFile: {
      screen: LiteFilePage,
      navigationOptions: {
        drawerLockMode: 'locked-closed',
      },
    },
  },
  {
    headerMode: 'none',
  },
);

export const AppNavigator = mainStackNavigator;
export const navigatorReducer = createNavigationReducer(AppNavigator);
export const reactNavigationMiddleware = createReactNavigationReduxMiddleware(state => state.nav);

const App = createReduxContainer(mainStackNavigator);
const appMapStateToProps = state => ({
  state: state.nav,
});
const ReduxAppNavigator = connect(appMapStateToProps)(App);

class AppWithNavigationState extends React.Component {
  static supportedDisplayTypes = ['toast'];

  constructor() {
    super();
    this.emailVerifyCheckInterval = null;
    this.syncGetInterval = null;
    this.state = {
      emailVerifyDone: false,
      verifyPending: false,
      syncHashChanged: false,
    };
  }

  componentWillMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    BackHandler.addEventListener(
      'hardwareBackPress',
      function() {
        const { dispatch, nav, drawerStack } = this.props;
        if (drawerStack.length > 1) {
          dispatchNavigateBack(dispatch, nav, drawerStack);
          return true;
        }

        return false;
      }.bind(this),
    );
  }

  componentDidMount() {
    const { dispatch, user } = this.props;
    this.emailVerifyCheckInterval = setInterval(() => this.checkEmailVerification(), 5000);
    Linking.addEventListener('url', this._handleUrl);

    DeviceEventEmitter.addListener('onDownloadAborted', this.handleDownloadAborted);
    DeviceEventEmitter.addListener('onDownloadStarted', this.handleDownloadStarted);
    DeviceEventEmitter.addListener('onDownloadUpdated', this.handleDownloadUpdated);
    DeviceEventEmitter.addListener('onDownloadCompleted', this.handleDownloadCompleted);

    // call /sync/get with interval
    this.syncGetInterval = setInterval(() => {
      this.setState({ syncHashChanged: false }); // reset local state
      if (user && user.has_verified_email) {
        NativeModules.UtilityModule.getSecureValue(Constants.KEY_WALLET_PASSWORD).then(walletPassword => {
          dispatch(doGetSync(walletPassword, () => this.getUserSettings()));
        });
      }
    }, SYNC_GET_INTERVAL);
  }

  checkEmailVerification = () => {
    const { dispatch } = this.props;
    AsyncStorage.getItem(Constants.KEY_EMAIL_VERIFY_PENDING).then(pending => {
      this.setState({ verifyPending: pending === Constants.TRUE_STRING });
      if (pending === Constants.TRUE_STRING) {
        dispatch(doUserCheckEmailVerified());
      }
    });
  };

  getUserSettings = () => {
    const { dispatch } = this.props;
    doPreferenceGet(
      'shared',
      preference => {
        dispatch(doPopulateSharedUserState(preference));
      },
      error => {
        /* failed */
      },
    );
  };

  handleDownloadStarted = evt => {
    const { dispatch } = this.props;
    const { uri, outpoint, fileInfo } = evt;
    dispatch(doStartDownload(uri, outpoint, fileInfo));
  };

  handleDownloadUpdated = evt => {
    const { dispatch } = this.props;
    const { uri, outpoint, fileInfo, progress } = evt;
    dispatch(doUpdateDownload(uri, outpoint, fileInfo, progress));
  };

  handleDownloadCompleted = evt => {
    const { dispatch } = this.props;
    const { uri, outpoint, fileInfo } = evt;
    dispatch(doCompleteDownload(uri, outpoint, fileInfo));
  };

  handleDownloadAborted = evt => {
    const { dispatch } = this.props;
    const { uri, outpoint } = evt;
    dispatch({
      type: ACTIONS.DOWNLOADING_CANCELED,
      data: { uri, outpoint },
    });

    dispatch({
      type: ACTIONS.FILE_DELETE,
      data: {
        outpoint,
      },
    });
  };

  componentWillUnmount() {
    DeviceEventEmitter.removeListener('onDownloadAborted', this.handleDownloadAborted);
    DeviceEventEmitter.removeListener('onDownloadStarted', this.handleDownloadStarted);
    DeviceEventEmitter.removeListener('onDownloadUpdated', this.handleDownloadUpdated);
    DeviceEventEmitter.removeListener('onDownloadCompleted', this.handleDownloadCompleted);

    AppState.removeEventListener('change', this._handleAppStateChange);
    BackHandler.removeEventListener('hardwareBackPress');
    Linking.removeEventListener('url', this._handleUrl);
    if (this.emailVerifyCheckInterval > -1) {
      clearInterval(this.emailVerifyCheckInterval);
    }
    if (this.syncGetInterval > -1) {
      clearInterval(this.syncGetInterval);
    }
  }

  componentDidUpdate() {
    const { dispatch, user, hashChanged } = this.props;
    if (this.state.verifyPending && this.emailVerifyCheckInterval > 0 && user && user.has_verified_email) {
      clearInterval(this.emailVerifyCheckInterval);
      AsyncStorage.setItem(Constants.KEY_EMAIL_VERIFY_PENDING, 'false');
      this.setState({ verifyPending: false });

      NativeModules.Firebase.track('email_verified', { email: user.primary_email });
      Snackbar.show({ title: __('Your email address was successfully verified.'), duration: Snackbar.LENGTH_LONG });

      // get user settings after email verification
      this.getUserSettings();
    }

    if (hashChanged && !this.state.syncHashChanged) {
      this.setState({ syncHashChanged: true });
      this.getUserSettings();
    }
  }

  componentWillUpdate(nextProps) {
    const { dispatch } = this.props;
    const { toast, emailToVerify, emailVerifyPending, emailVerifyErrorMessage, user } = nextProps;

    if (toast) {
      const { message, isError } = toast;
      let currentDisplayType;
      if (!currentDisplayType && message) {
        // default to toast if no display type set and there is a message specified
        currentDisplayType = 'toast';
      }

      if (currentDisplayType === 'toast') {
        const props = {
          title: message,
          duration: Snackbar.LENGTH_LONG,
        };
        if (isError) {
          props.backgroundColor = Colors.Red;
        }
        Snackbar.show(props);
      }

      dispatch(doDismissToast());
    }

    if (user && !emailVerifyPending && !this.state.emailVerifyDone && (emailToVerify || emailVerifyErrorMessage)) {
      AsyncStorage.getItem(Constants.KEY_SHOULD_VERIFY_EMAIL).then(shouldVerify => {
        if (shouldVerify === 'true') {
          this.setState({ emailVerifyDone: true });
          const message = emailVerifyErrorMessage
            ? String(emailVerifyErrorMessage)
            : __('Your email address was successfully verified.');
          if (!emailVerifyErrorMessage) {
            AsyncStorage.removeItem(Constants.KEY_FIRST_RUN_EMAIL);
          }

          AsyncStorage.removeItem(Constants.KEY_SHOULD_VERIFY_EMAIL);
          dispatch(doToast({ message }));
        }
      });
    }
  }

  _handleAppStateChange = nextAppState => {
    const { backgroundPlayEnabled, dispatch } = this.props;
    // Check if the app was suspended
    if (AppState.currentState && AppState.currentState.match(/inactive|background/)) {
      AsyncStorage.getItem('firstLaunchTime').then(start => {
        if (start !== null && !isNaN(parseInt(start, 10))) {
          // App suspended during first launch?
          // If so, this needs to be included as a property when tracking
          AsyncStorage.setItem('firstLaunchSuspended', 'true');
        }

        // Background media
        if (backgroundPlayEnabled && NativeModules.BackgroundMedia && window.currentMediaInfo) {
          const { title, channel, uri } = window.currentMediaInfo;
          NativeModules.BackgroundMedia.showPlaybackNotification(title, channel, uri, false);
        }
      });
    }

    if (AppState.currentState && AppState.currentState.match(/active/)) {
      if (backgroundPlayEnabled || NativeModules.BackgroundMedia) {
        NativeModules.BackgroundMedia.hidePlaybackNotification();
      }

      // check fullscreen mode and show / hide navigation bar accordingly
      this.checkFullscreenMode();
    }
  };

  checkFullscreenMode = () => {
    const { fullscreenMode } = this.props;
    StatusBar.setHidden(fullscreenMode);

    if (fullscreenMode) {
      // fullscreen, so change orientation to landscape mode
      NativeModules.ScreenOrientation.lockOrientationLandscape();
      // hide the navigation bar (on devices that have the soft navigation bar)
      NativeModules.UtilityModule.hideNavigationBar();
    } else {
      // Switch back to portrait mode when the media is not fullscreen
      NativeModules.ScreenOrientation.lockOrientationPortrait();
      // hide the navigation bar (on devices that have the soft navigation bar)
      NativeModules.UtilityModule.showNavigationBar();
    }
  };

  _handleUrl = evt => {
    const { dispatch, nav } = this.props;
    if (evt.url) {
      if (evt.url.startsWith('lbry://?verify=')) {
        this.setState({ emailVerifyDone: false });
        let verification = {};
        try {
          verification = JSON.parse(atob(evt.url.substring(15)));
        } catch (error) {
          // console.log(error);
        }

        if (verification.token && verification.recaptcha) {
          AsyncStorage.setItem(Constants.KEY_SHOULD_VERIFY_EMAIL, 'true');
          try {
            dispatch(doUserEmailVerify(verification.token, verification.recaptcha));
          } catch (error) {
            const message = __('Invalid Verification Token');
            dispatch(doUserEmailVerifyFailure(message));
            dispatch(doToast({ message }));
          }
        } else {
          dispatch(
            doToast({
              message: 'Invalid Verification URI',
            }),
          );
        }
      } else {
        dispatchNavigateToUri(dispatch, nav, transformUrl(evt.url));
      }
    }
  };

  render() {
    return <ReduxAppNavigator />;
  }
}

const mapStateToProps = state => ({
  backgroundPlayEnabled: makeSelectClientSetting(SETTINGS.BACKGROUND_PLAY_ENABLED)(state),
  hashChanged: selectHashChanged(state),
  keepDaemonRunning: makeSelectClientSetting(SETTINGS.KEEP_DAEMON_RUNNING)(state),
  nav: state.nav,
  toast: selectToast(state),
  drawerStack: selectDrawerStack(state),
  emailToVerify: selectEmailToVerify(state),
  emailVerifyPending: selectEmailVerifyIsPending(state),
  emailVerifyErrorMessage: selectEmailVerifyErrorMessage(state),
  showNsfw: makeSelectClientSetting(SETTINGS.SHOW_NSFW)(state),
  user: selectUser(state),
  fullscreenMode: selectFullscreenMode(state),
});

export default connect(mapStateToProps)(AppWithNavigationState);
