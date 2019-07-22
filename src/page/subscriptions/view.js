import React from 'react';
import NavigationActions from 'react-navigation';
import {
  ActivityIndicator,
  FlatList,
  NativeModules,
  SectionList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { buildURI, parseURI } from 'lbry-redux';
import { uriFromFileInfo } from 'utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import Button from 'component/button';
import ClaimList from 'component/claimList';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import fileListStyle from 'styles/fileList';
import subscriptionsStyle from 'styles/subscriptions';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import FileItem from 'component/fileItem';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import ModalPicker from 'component/modalPicker';
import SubscribedChannelList from 'component/subscribedChannelList';
import SuggestedSubscriptions from 'component/suggestedSubscriptions';
import UriBar from 'component/uriBar';

class SubscriptionsPage extends React.PureComponent {
  state = {
    showingSuggestedSubs: false,
    showSortPicker: false,
    orderBy: ['release_time'],
    filteredChannels: [],
    currentSortByItem: Constants.SORT_BY_ITEMS[1], // should always default to sorting subscriptions by new
  };

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
  }

  onComponentFocused = () => {
    const {
      doFetchMySubscriptions,
      doFetchRecommendedSubscriptions,
      doSetViewMode,
      pushDrawerStack,
      setPlayerVisible,
      subscriptionsViewMode,
    } = this.props;

    pushDrawerStack();
    setPlayerVisible();
    doFetchMySubscriptions();
    doFetchRecommendedSubscriptions();
    doSetViewMode(subscriptionsViewMode || Constants.SUBSCRIPTIONS_VIEW_ALL);
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.FULL_ROUTE_NAME_MY_SUBSCRIPTIONS === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  changeViewMode = viewMode => {
    const { setClientSetting, doSetViewMode } = this.props;
    setClientSetting(Constants.SETTING_SUBSCRIPTIONS_VIEW_MODE, viewMode);
    doSetViewMode(viewMode);
  };

  handleSortByItemSelected = item => {
    let orderBy = [];
    switch (item.name) {
      case 'hot':
        orderBy = Constants.DEFAULT_ORDER_BY;
        break;

      case 'new':
        orderBy = ['release_time'];
        break;

      case 'top':
        orderBy = ['effective_amount'];
        break;
    }

    this.setState({ currentSortByItem: item, orderBy, showSortPicker: false });
  };

  handleChannelSelected = channelUri => {
    const { subscribedChannels } = this.props;
    this.setState({
      filteredChannels: channelUri === '_all' ? [] : subscribedChannels.filter(channel => channel.uri === channelUri),
    });
  };

  prependSubscribedChannelsWithAll = subscribedChannels => {
    const channelUris = subscribedChannels.map(channel => channel.uri);
    return ['_all'].concat(channelUris);
  };

  render() {
    const {
      subscribedChannels,
      allSubscriptions,
      loading,
      viewMode,
      doSetViewMode,
      loadingSuggested,
      firstRunCompleted,
      doCompleteFirstRun,
      doShowSuggestedSubs,
      showSuggestedSubs,
      unreadSubscriptions,
      navigation,
    } = this.props;
    const { currentSortByItem, filteredChannels } = this.state;

    const numberOfSubscriptions = subscribedChannels ? subscribedChannels.length : 0;
    const hasSubscriptions = numberOfSubscriptions > 0;

    if (!hasSubscriptions && !this.state.showingSuggestedSubs) {
      this.setState({ showingSuggestedSubs: true });
    }

    const channelIds =
      filteredChannels.length > 0
        ? filteredChannels.map(channel => {
          const { claimId } = parseURI(channel.uri);
          return claimId;
        })
        : subscribedChannels &&
          subscribedChannels.map(channel => {
            const { claimId } = parseURI(channel.uri);
            return claimId;
          });

    return (
      <View style={subscriptionsStyle.container}>
        <UriBar navigation={navigation} belowOverlay={this.state.showSortPicker} />
        <View style={subscriptionsStyle.titleRow}>
          <Text style={subscriptionsStyle.pageTitle}>Channels you follow</Text>
          {!this.state.showingSuggestedSubs && hasSubscriptions && (
            <TouchableOpacity
              style={subscriptionsStyle.tagSortBy}
              onPress={() => this.setState({ showSortPicker: true })}
            >
              <Text style={subscriptionsStyle.tagSortText}>{currentSortByItem.label.split(' ')[0]}</Text>
              <Icon style={subscriptionsStyle.tagSortIcon} name={'sort-down'} size={14} />
            </TouchableOpacity>
          )}
        </View>
        {!this.state.showingSuggestedSubs && hasSubscriptions && !loading && (
          <View style={subscriptionsStyle.subContainer}>
            <SubscribedChannelList
              subscribedChannels={this.prependSubscribedChannelsWithAll(subscribedChannels)}
              onChannelSelected={this.handleChannelSelected}
            />
            <ClaimList
              style={subscriptionsStyle.claimList}
              channelIds={channelIds}
              orderBy={this.state.orderBy}
              navigation={navigation}
              orientation={Constants.ORIENTATION_VERTICAL}
            />
          </View>
        )}

        {hasSubscriptions && loading && (
          <View style={subscriptionsStyle.busyContainer}>
            <ActivityIndicator size="large" color={Colors.LbryGreen} style={subscriptionsStyle.loading} />
          </View>
        )}

        {this.state.showingSuggestedSubs && (
          <View style={subscriptionsStyle.suggestedSubsContainer}>
            {!hasSubscriptions && (
              <Text style={subscriptionsStyle.infoText}>
                You are not subscribed to any channels at the moment. Here are some channels that we think you might
                enjoy.
              </Text>
            )}

            {hasSubscriptions && (
              <View>
                <Text style={subscriptionsStyle.infoText}>
                  You are currently subscribed to {numberOfSubscriptions} channel{numberOfSubscriptions > 1 ? 's' : ''}.
                </Text>
                <Button
                  style={subscriptionsStyle.button}
                  text={'View my subscriptions'}
                  onPress={() => this.setState({ showingSuggestedSubs: false })}
                />
              </View>
            )}

            {loadingSuggested && (
              <ActivityIndicator size="large" colors={Colors.LbryGreen} style={subscriptionsStyle.loading} />
            )}
            {!loadingSuggested && <SuggestedSubscriptions navigation={navigation} />}
          </View>
        )}

        {!this.state.showSortPicker && <FloatingWalletBalance navigation={navigation} />}
        {this.state.showSortPicker && (
          <ModalPicker
            title={'Sort content by'}
            onOverlayPress={() => this.setState({ showSortPicker: false })}
            onItemSelected={this.handleSortByItemSelected}
            selectedItem={this.state.currentSortByItem}
            items={Constants.SORT_BY_ITEMS}
          />
        )}
      </View>
    );
  }
}

export default SubscriptionsPage;
