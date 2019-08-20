import React from 'react';
import { DrawerItems, SafeAreaView } from 'react-navigation';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import discoverStyle from 'styles/discover';

const groupedMenuItems = {
  'Find content': [
    { icon: 'hashtag', label: 'Your tags', route: Constants.FULL_ROUTE_NAME_DISCOVER },
    { icon: 'heart', solid: true, label: 'Subscriptions', route: Constants.DRAWER_ROUTE_SUBSCRIPTIONS },
    { icon: 'globe-americas', label: 'All content', route: Constants.DRAWER_ROUTE_TRENDING },
  ],
  'Your content': [
    { icon: 'download', label: 'Library', route: Constants.DRAWER_ROUTE_MY_LBRY },
    { icon: 'cloud-upload-alt', label: 'Publishes', route: Constants.DRAWER_ROUTE_PUBLISHES },
    { icon: 'upload', label: 'New publish', route: Constants.DRAWER_ROUTE_PUBLISH },
  ],
  Wallet: [
    { icon: 'wallet', label: 'Wallet', route: Constants.FULL_ROUTE_NAME_WALLET },
    { icon: 'award', label: 'Rewards', route: Constants.DRAWER_ROUTE_REWARDS },
  ],
  Settings: [
    { icon: 'cog', label: 'Settings', route: Constants.DRAWER_ROUTE_SETTINGS },
    { icon: 'info', label: 'About', route: Constants.DRAWER_ROUTE_ABOUT },
  ],
};

const groupNames = Object.keys(groupedMenuItems);

class DrawerContent extends React.PureComponent {
  render() {
    const { activeTintColor, navigation, onItemPress } = this.props;
    const { state } = navigation;

    const activeItemKey = state.routes[state.index] ? state.routes[state.index].key : null;

    return (
      <ScrollView contentContainerStyle={discoverStyle.menuScrollContent}>
        <SafeAreaView style={discoverStyle.drawerContentContainer} forceInset={{ top: 'always', horizontal: 'never' }}>
          {groupNames.map(groupName => {
            const menuItems = groupedMenuItems[groupName];

            return (
              <View key={groupName} style={discoverStyle.menuGroup}>
                {groupNames[3] !== groupName && (
                  <Text key={`${groupName}-title`} style={discoverStyle.menuGroupName}>
                    {groupName}
                  </Text>
                )}
                {menuItems.map(item => {
                  const focused = activeItemKey === item.route;
                  return (
                    <TouchableOpacity
                      accessible
                      accessibilityLabel={item.label}
                      style={[discoverStyle.menuItemTouchArea, focused ? discoverStyle.menuItemTouchAreaFocused : null]}
                      key={item.label}
                      onPress={() => navigation.navigate({ routeName: item.route })}
                      delayPressIn={0}
                    >
                      <View style={discoverStyle.menuItemIcon}>
                        <Icon name={item.icon} size={16} solid={item.solid} color={focused ? activeTintColor : null} />
                      </View>
                      <Text style={[discoverStyle.menuItem, focused ? discoverStyle.menuItemFocused : null]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </SafeAreaView>
      </ScrollView>
    );
  }
}

export default DrawerContent;
