import React from 'react';
import { SETTINGS } from 'lbry-redux';
import { Text, View, ScrollView, Switch, NativeModules } from 'react-native';
import { __, navigateBack } from 'utils/helper';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PageHeader from 'component/pageHeader';
import settingsStyle from 'styles/settings';

class SettingsPage extends React.PureComponent {
  static navigationOptions = {
    title: 'Settings',
  };

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

  onComponentFocused = () => {
    const { pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Settings');
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_SETTINGS === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  setNativeBooleanSetting = (key, value) => {
    const { setClientSetting } = this.props;
    setClientSetting(key, value);
    NativeModules.UtilityModule.setNativeBooleanSetting(key, value);
  };

  getBooleanSetting = (value, defaultValue) => {
    return value === null || value === undefined ? defaultValue : value;
  };

  render() {
    const {
      backgroundPlayEnabled,
      drawerStack,
      keepDaemonRunning,
      navigation,
      popDrawerStack,
      receiveSubscriptionNotifications,
      receiveRewardNotifications,
      receiveInterestsNotifications,
      receiveCreatorNotifications,
      showNsfw,
      showUriBarSuggestions,
      setClientSetting,
    } = this.props;

    // default to true if the setting is null or undefined
    const actualKeepDaemonRunning = this.getBooleanSetting(keepDaemonRunning, true);
    const actualReceiveSubscriptionNotifications = this.getBooleanSetting(receiveSubscriptionNotifications, true);
    const actualReceiveRewardNotifications = this.getBooleanSetting(receiveRewardNotifications, true);
    const actualReceiveInterestsNotifications = this.getBooleanSetting(receiveInterestsNotifications, true);
    const actualReceiveCreatorNotifications = this.getBooleanSetting(receiveCreatorNotifications, true);

    return (
      <View style={settingsStyle.container}>
        <PageHeader title={'Settings'} onBackPressed={() => navigateBack(navigation, drawerStack, popDrawerStack)} />
        <ScrollView style={settingsStyle.scrollContainer}>
          <Text style={settingsStyle.sectionTitle}>Content</Text>
          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>Enable background media playback</Text>
              <Text style={settingsStyle.description}>
                Enable this option to play audio or video in the background when the app is suspended.
              </Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={backgroundPlayEnabled}
                onValueChange={value => setClientSetting(SETTINGS.BACKGROUND_PLAY_ENABLED, value)}
              />
            </View>
          </View>

          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>Show mature content</Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch value={showNsfw} onValueChange={value => setClientSetting(SETTINGS.SHOW_NSFW, value)} />
            </View>
          </View>

          <View style={settingsStyle.sectionDivider} />
          <Text style={settingsStyle.sectionTitle}>{__('Notifications')}</Text>
          <Text style={settingsStyle.sectionDescription}>
            {__('Choose the notifications you would like to receive.')}
          </Text>
          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>{__('Subscriptions')}</Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={actualReceiveSubscriptionNotifications}
                onValueChange={value => {
                  this.setNativeBooleanSetting(SETTINGS.RECEIVE_SUBSCRIPTION_NOTIFICATIONS, value);
                }}
              />
            </View>
          </View>

          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>{__('Rewards')}</Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={actualReceiveRewardNotifications}
                onValueChange={value => {
                  this.setNativeBooleanSetting(SETTINGS.RECEIVE_REWARD_NOTIFICATIONS, value);
                }}
              />
            </View>
          </View>

          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>{__('Content Interests')}</Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={actualReceiveInterestsNotifications}
                onValueChange={value => {
                  this.setNativeBooleanSetting(SETTINGS.RECEIVE_INTERESTS_NOTIFICATIONS, value);
                }}
              />
            </View>
          </View>

          {false && (
            <View style={settingsStyle.row}>
              <View style={settingsStyle.switchText}>
                <Text style={settingsStyle.label}>{__('Content creator tips')}</Text>
              </View>
              <View style={settingsStyle.switchContainer}>
                <Switch
                  value={actualReceiveCreatorNotifications}
                  onValueChange={value => {
                    this.setNativeBooleanSetting(SETTINGS.RECEIVE_CREATOR_NOTIFICATIONS, value);
                  }}
                />
              </View>
            </View>
          )}

          <View style={settingsStyle.sectionDivider} />
          <Text style={settingsStyle.sectionTitle}>Search</Text>
          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>Show URL suggestions</Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={showUriBarSuggestions}
                onValueChange={value => setClientSetting(SETTINGS.SHOW_URI_BAR_SUGGESTIONS, value)}
              />
            </View>
          </View>

          <View style={settingsStyle.sectionDivider} />
          <Text style={settingsStyle.sectionTitle}>Other</Text>
          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>Keep the daemon background service running after closing the app</Text>
              <Text style={settingsStyle.description}>
                Enable this option for quicker app launch and to keep the synchronisation with the blockchain up to
                date.
              </Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={actualKeepDaemonRunning}
                onValueChange={value => {
                  setClientSetting(SETTINGS.KEEP_DAEMON_RUNNING, value);
                  if (NativeModules.DaemonServiceControl) {
                    NativeModules.DaemonServiceControl.setKeepDaemonRunning(value);
                  }
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default SettingsPage;
