import React from 'react';
import { DrawerItems, SafeAreaView } from 'react-navigation';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Button from 'component/button';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import channelIconStyle from 'styles/channelIcon';
import discoverStyle from 'styles/discover';
import { Lbryio } from 'lbryinc';
import { formatUsd } from 'utils/helper';

const groupedMenuItems = {
  'Find content': [
    { icon: 'heart', solid: true, label: 'Following', route: Constants.DRAWER_ROUTE_SUBSCRIPTIONS },
    { icon: 'hashtag', label: 'Your Tags', route: Constants.DRAWER_ROUTE_DISCOVER },
    { icon: 'globe-americas', label: 'All Content', route: Constants.DRAWER_ROUTE_TRENDING },
  ],
  'Your content': [
    { icon: 'at', label: 'Channels', route: Constants.DRAWER_ROUTE_CHANNEL_CREATOR },
    { icon: 'download', label: 'Library', route: Constants.DRAWER_ROUTE_MY_LBRY },
    { icon: 'cloud-upload-alt', label: 'Publishes', route: Constants.DRAWER_ROUTE_PUBLISHES },
    { icon: 'upload', label: 'New Publish', route: Constants.DRAWER_ROUTE_PUBLISH },
  ],
  Wallet: [
    { icon: 'wallet', label: 'Wallet', route: Constants.DRAWER_ROUTE_WALLET },
    { icon: 'award', label: 'Rewards', route: Constants.DRAWER_ROUTE_REWARDS },
    { icon: 'user-friends', label: 'Invites', route: Constants.DRAWER_ROUTE_INVITES },
  ],
  Settings: [
    { icon: 'cog', label: 'Settings', route: Constants.DRAWER_ROUTE_SETTINGS },
    { icon: 'info', label: 'About', route: Constants.DRAWER_ROUTE_ABOUT },
  ],
};

const groupNames = Object.keys(groupedMenuItems);
const routesRequiringSdkReady = [
  Constants.DRAWER_ROUTE_CHANNEL_CREATOR,
  Constants.DRAWER_ROUTE_MY_LBRY,
  Constants.DRAWER_ROUTE_PUBLISHES,
  Constants.DRAWER_ROUTE_PUBLISH,
  Constants.DRAWER_ROUTE_WALLET,
  Constants.DRAWER_ROUTE_REWARDS,
  Constants.DRAWER_ROUTE_INVITES,
];

class DrawerContent extends React.PureComponent {
  state = {
    usdExchangeRate: 0,
  };

  componentDidMount() {
    Lbryio.getExchangeRates().then(rates => {
      if (!isNaN(rates.LBC_USD)) {
        this.setState({ usdExchangeRate: rates.LBC_USD });
      }
    });
  }

  getAvatarImageUrl = () => {
    const { channels = [] } = this.props;
    if (channels) {
      // get the first channel thumbnail found. In the future, allow the user to select a default channel thumbnail?
      for (let i = 0; i < channels.length; i++) {
        if (channels[i].value && channels[i].value.thumbnail) {
          return channels[i].value.thumbnail.url;
        }
      }
    }

    return null;
  };

  launchSignInFlow = () => {
    // for now, sync flow (email, then password input) will be the default sign in flow
    const { navigation } = this.props;
    navigation.navigate({
      routeName: 'Verification',
      key: 'verification',
      params: { syncFlow: true, signInFlow: true },
    });
  };

  handleItemPress = routeName => {
    const { navigation, notify, sdkReady } = this.props;
    if (!sdkReady && routesRequiringSdkReady.includes(routeName)) {
      if (navigation.closeDrawer) {
        navigation.closeDrawer();
      }
      notify({
        message: __('The background service is still initializing. Please try again when initialization is complete.'),
      });
      return;
    }

    navigation.navigate({ routeName: routeName });
  };

  render() {
    const { activeTintColor, balance, navigation, unclaimedRewardAmount, user, onItemPress } = this.props;
    const { state } = navigation;

    const activeItemKey = state.routes[state.index] ? state.routes[state.index].key : null;
    const signedIn = user && user.has_verified_email;
    const avatarImageUrl = this.getAvatarImageUrl();

    return (
      <View style={discoverStyle.drawerContentArea}>
        {false && (
          <View style={discoverStyle.signInContainer}>
            {!signedIn && (
              <Button
                style={discoverStyle.signInButton}
                theme={'light'}
                text={__('Sign in')}
                onPress={this.launchSignInFlow}
              />
            )}
            {signedIn && (
              <View style={discoverStyle.signedIn}>
                <View style={discoverStyle.signedInAvatar}>
                  {avatarImageUrl && (
                    <Image
                      style={discoverStyle.signedInAvatarImage}
                      resizeMode={'cover'}
                      source={{ uri: avatarImageUrl }}
                    />
                  )}
                  {!avatarImageUrl && (
                    <Text style={channelIconStyle.autothumbCharacter}>
                      {user.primary_email.substring(0, 1).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={discoverStyle.signedInEmail} numberOfLines={1}>
                  {user.primary_email}
                </Text>
              </View>
            )}
          </View>
        )}

        <ScrollView contentContainerStyle={discoverStyle.menuScrollContent}>
          <SafeAreaView
            style={discoverStyle.drawerContentContainer}
            forceInset={{ top: 'always', horizontal: 'never' }}
          >
            {!signedIn && (
              <TouchableOpacity
                accessible
                accessibilityLabel={__('Sign In')}
                onPress={this.launchSignInFlow}
                delayPressIn={0}
                style={[discoverStyle.signInMenuItem, discoverStyle.signInMenuItemButton]}
              >
                <Text style={discoverStyle.signInMenuItemButtonText}>{__('SIGN IN')}</Text>
              </TouchableOpacity>
            )}

            {signedIn && (
              <View style={[discoverStyle.signInMenuItem, discoverStyle.signInMenuItemBorder]}>
                <Text style={discoverStyle.signInMenuItemText} numberOfLines={1}>
                  {user.primary_email.toUpperCase()}
                </Text>
              </View>
            )}

            {groupNames.map(groupName => {
              const menuItems = groupedMenuItems[groupName];

              return (
                <View key={groupName} style={discoverStyle.menuGroup}>
                  {groupNames[3] !== groupName && (
                    <Text key={`${groupName}-title`} style={discoverStyle.menuGroupName}>
                      {__(groupName)}
                    </Text>
                  )}
                  {menuItems.map(item => {
                    const focused =
                      activeItemKey === item.route ||
                      (activeItemKey === Constants.FULL_ROUTE_NAME_DISCOVER &&
                        item.route === Constants.DRAWER_ROUTE_SUBSCRIPTIONS) ||
                      (activeItemKey === Constants.FULL_ROUTE_NAME_WALLET &&
                        item.route === Constants.DRAWER_ROUTE_WALLET);
                    return (
                      <TouchableOpacity
                        accessible
                        accessibilityLabel={__(item.label)}
                        style={[
                          discoverStyle.menuItemTouchArea,
                          focused ? discoverStyle.menuItemTouchAreaFocused : null,
                        ]}
                        key={item.label}
                        onPress={() => this.handleItemPress(item.route)}
                        delayPressIn={0}
                      >
                        <View style={discoverStyle.menuItemIcon}>
                          <Icon
                            name={item.icon}
                            size={16}
                            solid={item.solid}
                            color={focused ? activeTintColor : null}
                          />
                        </View>
                        <Text style={[discoverStyle.menuItem, focused ? discoverStyle.menuItemFocused : null]}>
                          {__(item.label)}
                          {item.label === 'Wallet' && this.state.usdExchangeRate > 0 && (
                            <Text> ({formatUsd(parseFloat(balance) * parseFloat(this.state.usdExchangeRate))})</Text>
                          )}
                          {item.label === 'Rewards' && this.state.usdExchangeRate > 0 && (
                            <Text>
                              {' '}
                              ({formatUsd(parseFloat(unclaimedRewardAmount) * parseFloat(this.state.usdExchangeRate))})
                            </Text>
                          )}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </SafeAreaView>
        </ScrollView>
      </View>
    );
  }
}

export default DrawerContent;
