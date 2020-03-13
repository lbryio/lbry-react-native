import React from 'react';
import { SETTINGS } from 'lbry-redux';
import { ActivityIndicator, Picker, Platform, Text, View, ScrollView, Switch, NativeModules } from 'react-native';
import { navigateBack } from 'utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PageHeader from 'component/pageHeader';
import RNFS from 'react-native-fs';
import settingsStyle from 'styles/settings';

const languageOptions = [
  { code: 'default', name: 'Use device language' },
  { code: 'en', name: 'English' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'hi', name: 'Hindi' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ms', name: 'Malay' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'es', name: 'Spanish' },
];

class SettingsPage extends React.PureComponent {
  state = {
    downloadingLanguage: false,
  };

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

  handleLanguageValueChange = value => {
    const { notify, setClientSetting } = this.props;

    let language;
    if (value === 'default') {
      language =
        Platform.OS === 'android'
          ? NativeModules.I18nManager.localeIdentifier
          : NativeModules.SettingsManager.settings.AppleLocale;
      language = language ? language.substring(0, 2) : 'en';
    } else {
      language = value;
    }

    // check the local filesystem for the language first? Or download remote strings first?
    if (language === 'en') {
      // don't attempt to download English
      NativeModules.UtilityModule.setNativeStringSetting(SETTINGS.LANGUAGE, language);

      // update state and client setting
      window.language = language;
      setClientSetting(SETTINGS.LANGUAGE, value);
    } else {
      // download and save the language file
      this.setState({ downloadingLanguage: true }, () => {
        fetch('https://lbry.com/i18n/get/lbry-mobile/app-strings/' + language + '.json')
          .then(r => r.json())
          .then(j => {
            window.i18n_messages[language] = j;

            // write the language file to the filesystem
            const langFilePath = RNFS.ExternalDirectoryPath + '/' + language + '.json';
            RNFS.writeFile(langFilePath, JSON.stringify(j), 'utf8');

            // save the setting outside redux because when the first component mounts, the redux value isn't loaded yet
            // so we have to load it from native settings
            NativeModules.UtilityModule.setNativeStringSetting(SETTINGS.LANGUAGE, language);

            // update state and client setting
            window.language = language;
            setClientSetting(SETTINGS.LANGUAGE, value);

            this.setState({ downloadingLanguage: false });
          })
          .catch(e => {
            notify({ message: __('Failed to load %language% translations.', { language: language }), isError: true });
            this.setState({ downloadingLanguage: false });
          });
      });
    }
  };

  handleBackPressed = () => {
    const { navigation, notify, drawerStack, popDrawerStack } = this.props;

    if (this.state.downloadingLanguage) {
      notify({ message: 'Please wait for the language file to finish downloading' });
      return;
    }

    navigateBack(navigation, drawerStack, popDrawerStack);
  };

  render() {
    const {
      backgroundPlayEnabled,
      enableDht,
      keepDaemonRunning,
      receiveSubscriptionNotifications,
      receiveRewardNotifications,
      receiveInterestsNotifications,
      receiveCreatorNotifications,
      language,
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
    const actualEnableDht = this.getBooleanSetting(enableDht, false);

    return (
      <View style={settingsStyle.container}>
        <PageHeader title={__('Settings')} onBackPressed={this.handleBackPressed} />
        <ScrollView style={settingsStyle.scrollContainer}>
          <Text style={settingsStyle.sectionTitle}>{__('Content')}</Text>
          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>{__('Enable background media playback')}</Text>
              <Text style={settingsStyle.description}>
                {__('Enable this option to play audio or video in the background when the app is suspended.')}
              </Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={backgroundPlayEnabled}
                onValueChange={value => setClientSetting(SETTINGS.BACKGROUND_PLAY_ENABLED, value)}
              />
            </View>
          </View>

          <Text style={settingsStyle.sectionTitle}>{__('Language')}</Text>
          <View style={settingsStyle.pickerRow}>
            <View style={settingsStyle.pickerText}>
              <Text style={settingsStyle.label}>{__('Choose language')}</Text>
            </View>
            <View style={settingsStyle.pickerContainer}>
              {this.state.downloadingLanguage && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}
              <Picker
                enabled={!this.state.downloadingLanguage}
                selectedValue={language || 'default'}
                style={settingsStyle.languagePicker}
                itemStyle={settingsStyle.languagePickerItem}
                onValueChange={this.handleLanguageValueChange}
              >
                {languageOptions.map(option => (
                  <Picker.Item label={__(option.name)} value={option.code} key={option.code} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>{__('Show mature content')}</Text>
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
          <Text style={settingsStyle.sectionTitle}>{__('Search')}</Text>
          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>{__('Show URL suggestions')}</Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={showUriBarSuggestions}
                onValueChange={value => setClientSetting(SETTINGS.SHOW_URI_BAR_SUGGESTIONS, value)}
              />
            </View>
          </View>

          <View style={settingsStyle.sectionDivider} />
          <Text style={settingsStyle.sectionTitle}>{__('Other')}</Text>
          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>
                {__('Keep the SDK background service running after closing the app')}
              </Text>
              <Text style={settingsStyle.description}>
                {__(
                  'Enable this option for quicker app launch and to keep the synchronisation with the blockchain up to date.',
                )}
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

          <View style={settingsStyle.row}>
            <View style={settingsStyle.switchText}>
              <Text style={settingsStyle.label}>{__('Participate in the data network')}</Text>
              <Text style={settingsStyle.description}>
                {__('Enable DHT (this will take effect upon app and background service restart)')}
              </Text>
            </View>
            <View style={settingsStyle.switchContainer}>
              <Switch
                value={actualEnableDht}
                onValueChange={value => {
                  this.setNativeBooleanSetting(Constants.SETTING_DHT_ENABLED, value);
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
