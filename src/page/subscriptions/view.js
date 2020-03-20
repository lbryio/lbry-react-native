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
import { getOrderBy } from 'utils/helper';
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
import ModalSuggestedSubscriptions from 'component/modalSuggestedSubscriptions';
import SubscribedChannelList from 'component/subscribedChannelList';
import SuggestedSubscriptions from 'component/suggestedSubscriptions';
import SuggestedSubscriptionsGrid from 'component/suggestedSubscriptionsGrid';
import UriBar from 'component/uriBar';
import SdkLoadingStatus from 'component/sdkLoadingStatus';

class SubscriptionsPage extends React.PureComponent {
  state = {
    showingSuggestedSubs: false,
    showSortPicker: false,
    showTimePicker: false,
    showModalSuggestedSubs: false,
    orderBy: ['release_time'],
    filteredChannels: [],
    currentSortByItem: Constants.CLAIM_SEARCH_SORT_BY_ITEMS[1], // should always default to sorting subscriptions by new
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
    const {
      currentRoute,
      doFetchMySubscriptions,
      doFetchRecommendedSubscriptions,
      doSetViewMode,
      pushDrawerStack,
      setPlayerVisible,
      subscriptionsViewMode,
    } = this.props;

    if (currentRoute === Constants.DRAWER_ROUTE_SUBSCRIPTIONS) {
      pushDrawerStack();
    }
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Subscriptions');

    doFetchMySubscriptions();
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_SUBSCRIPTIONS === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }

    this.unsubscribeShortChannelUrls();
  }

  handleSortByItemSelected = item => {
    this.setState({ currentSortByItem: item, orderBy: getOrderBy(item), showSortPicker: false });
  };

  shouldComponentUpdate(nextProps, nextState) {
    const { showModalSuggestedSubs: prevShowModalSuggestedSubs } = this.state;
    const { showModalSuggestedSubs } = this.state;
    if (prevShowModalSuggestedSubs && showModalSuggestedSubs) {
      return false;
    }
    return true;
  }

  handleTimeItemSelected = item => {
    const { setTimeItem } = this.props;
    setTimeItem(item);
    this.setState({ showTimePicker: false });
  };

  handleChannelSelected = channelUri => {
    const { subscribedChannels } = this.props;
    this.setState({
      filteredChannels:
        channelUri === Constants.ALL_PLACEHOLDER
          ? []
          : subscribedChannels.filter(channel => channel.uri === channelUri),
    });
  };

  prependSubscribedChannelsWithAll = subscribedChannels => {
    const channelUris = subscribedChannels.map(channel => channel.uri);
    return [Constants.ALL_PLACEHOLDER].concat(channelUris);
  };

  // Added in 0.12.1. Can be dropped on or after 1 Feb 2020.
  unsubscribeShortChannelUrls = () => {
    // this should only have to happen once
    const { subscribedChannels, channelUnsubscribe } = this.props;
    const badSubs = subscribedChannels.filter(sub => {
      const parts = sub.uri.split('#');
      return parts.length === 1 || parts[1].length < 5;
    });
    if (badSubs.length > 0) {
      badSubs.forEach(sub => channelUnsubscribe(sub));
    }
  };

  render() {
    const { subscribedChannels, loading, loadingSuggested, sdkReady, timeItem, navigation, notify } = this.props;
    const { currentSortByItem, filteredChannels, showModalSuggestedSubs, showSortPicker, showTimePicker } = this.state;

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
          <Text style={subscriptionsStyle.pageTitle}>
            {hasSubscriptions && !this.state.showingSuggestedSubs
              ? __('Channels you follow')
              : __('Find Channels to follow')}
          </Text>
        </View>
        {!this.state.showingSuggestedSubs && hasSubscriptions && (
          <View style={subscriptionsStyle.pickerRow}>
            <View style={subscriptionsStyle.leftPickerRow}>
              <TouchableOpacity
                style={subscriptionsStyle.tagSortBy}
                onPress={() => this.setState({ showSortPicker: true })}
              >
                <Text style={subscriptionsStyle.tagSortText}>{__(currentSortByItem.label.split(' ')[0])}</Text>
                <Icon style={subscriptionsStyle.tagSortIcon} name={'sort-down'} size={14} />
              </TouchableOpacity>

              {Constants.SORT_BY_TOP === currentSortByItem.name && (
                <TouchableOpacity
                  style={subscriptionsStyle.tagSortBy}
                  onPress={() => this.setState({ showTimePicker: true })}
                >
                  <Text style={subscriptionsStyle.tagSortText}>{__(timeItem.label)}</Text>
                  <Icon style={subscriptionsStyle.tagSortIcon} name={'sort-down'} size={14} />
                </TouchableOpacity>
              )}
            </View>

            <Link
              style={subscriptionsStyle.suggestedLink}
              text={__('Discover')}
              onPress={() => this.setState({ showModalSuggestedSubs: true })}
            />
          </View>
        )}
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
              time={timeItem.name}
              navigation={navigation}
              orientation={Constants.ORIENTATION_VERTICAL}
            />
          </View>
        )}

        {hasSubscriptions && loading && (
          <View style={subscriptionsStyle.busyContainer}>
            <ActivityIndicator size="large" color={Colors.NextLbryGreen} style={subscriptionsStyle.loading} />
          </View>
        )}

        {this.state.showingSuggestedSubs && (
          <View style={subscriptionsStyle.suggestedSubsContainer}>
            <View style={subscriptionsStyle.infoArea}>
              <Text style={subscriptionsStyle.infoText}>
                {__(
                  'LBRY works better if you follow at least 5 creators you like. Sign in to show creators you follow if you already have an account.',
                )}
              </Text>
            </View>

            <View style={subscriptionsStyle.mainSuggested}>
              <SuggestedSubscriptionsGrid navigation={navigation} />
            </View>

            <Button
              style={subscriptionsStyle.suggestedDoneButton}
              text={
                numberOfSubscriptions < 5
                  ? __('%remaining% more...', { remaining: 5 - numberOfSubscriptions })
                  : __('Done')
              }
              onPress={() => {
                if (!hasSubscriptions) {
                  notify({ message: __('Tap on any channel to follow') });
                } else {
                  this.setState({ showingSuggestedSubs: false });
                }
              }}
            />

            {loadingSuggested && (
              <ActivityIndicator size="small" color={Colors.White} style={subscriptionsStyle.suggestedLoading} />
            )}
          </View>
        )}

        {showSortPicker && (
          <ModalPicker
            title={__('Sort content by')}
            onOverlayPress={() => this.setState({ showSortPicker: false })}
            onItemSelected={this.handleSortByItemSelected}
            selectedItem={currentSortByItem}
            items={Constants.CLAIM_SEARCH_SORT_BY_ITEMS}
          />
        )}
        {showTimePicker && (
          <ModalPicker
            title={__('Content from')}
            onOverlayPress={() => this.setState({ showTimePicker: false })}
            onItemSelected={this.handleTimeItemSelected}
            selectedItem={timeItem}
            items={Constants.CLAIM_SEARCH_TIME_ITEMS}
          />
        )}
        {showModalSuggestedSubs && (
          <ModalSuggestedSubscriptions
            navigation={navigation}
            onOverlayPress={() => this.setState({ showModalSuggestedSubs: false })}
            onDonePress={() => this.setState({ showModalSuggestedSubs: false })}
          />
        )}

        {!sdkReady && <SdkLoadingStatus />}
      </View>
    );
  }
}

export default SubscriptionsPage;
