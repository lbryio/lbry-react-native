import React from 'react';
import NavigationActions from 'react-navigation';
import {
  Alert,
  ActivityIndicator,
  Linking,
  NativeModules,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEFAULT_FOLLOWED_TAGS, Lbry, normalizeURI, parseURI } from 'lbry-redux';
import { __, formatTagTitle, getOrderBy } from 'utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import CategoryList from 'component/categoryList';
import ClaimList from 'component/claimList';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Colors from 'styles/colors';
import discoverStyle from 'styles/discover';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import ModalTagSelector from 'component/modalTagSelector';
import ModalPicker from 'component/modalPicker';
import UriBar from 'component/uriBar';
import _ from 'lodash';

class DiscoverPage extends React.PureComponent {
  state = {
    tagCollection: [],
    remainingTags: [],
    showModalTagSelector: false,
    showSortPicker: false,
    showTimePicker: false,
    orderBy: Constants.DEFAULT_ORDER_BY,
  };

  componentDidMount() {
    // Track the total time taken if this is the first launch
    AsyncStorage.getItem('firstLaunchTime').then(startTime => {
      if (startTime !== null && !isNaN(parseInt(startTime, 10))) {
        // We don't need this value anymore once we've retrieved it
        AsyncStorage.removeItem('firstLaunchTime');

        // We know this is the first app launch because firstLaunchTime is set and it"s a valid number
        const start = parseInt(startTime, 10);
        const now = moment().unix();
        const delta = now - start;
        AsyncStorage.getItem('firstLaunchSuspended').then(suspended => {
          AsyncStorage.removeItem('firstLaunchSuspended');
          const appSuspended = suspended === 'true';
          if (NativeModules.Firebase) {
            NativeModules.Firebase.track('first_run_time', {
              total_seconds: delta,
              app_suspended: appSuspended,
            });
          }
        });
      }
    });

    const { sortByItem, fetchRewardedContent, fetchSubscriptions, fileList, followedTags } = this.props;

    this.buildTagCollection(followedTags);
    fetchRewardedContent();
    fetchSubscriptions();
    fileList();

    this.handleSortByItemSelected(sortByItem);
    this.showRatingReminder();
  }

  handleSortByItemSelected = item => {
    const { setSortByItem } = this.props;
    setSortByItem(item);
    const orderBy = getOrderBy(item);
    this.setState({ orderBy, showSortPicker: false });
  };

  handleTimeItemSelected = item => {
    const { setTimeItem } = this.props;
    setTimeItem(item);
    this.setState({ showTimePicker: false });
  };

  subscriptionForUri = (uri, channelName) => {
    const { allSubscriptions } = this.props;
    const { claimId, claimName } = parseURI(uri);

    if (allSubscriptions) {
      for (let i = 0; i < allSubscriptions.length; i++) {
        const sub = allSubscriptions[i];

        if (sub.claim_id === claimId && sub.name === claimName && sub.channel_name === channelName) {
          return sub;
        }
      }
    }

    return null;
  };

  componentWillReceiveProps(nextProps) {
    const { followedTags: prevFollowedTags } = this.props;
    const { followedTags } = nextProps;
    if (!_.isEqual(followedTags, prevFollowedTags)) {
      this.buildTagCollection(followedTags);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { unreadSubscriptions, enabledChannelNotifications } = this.props;

    const utility = NativeModules.UtilityModule;
    if (utility) {
      const hasUnread =
        prevProps.unreadSubscriptions &&
        prevProps.unreadSubscriptions.length !== unreadSubscriptions.length &&
        unreadSubscriptions.length > 0;

      if (hasUnread) {
        unreadSubscriptions.map(({ channel, uris }) => {
          const { claimName: channelName } = parseURI(channel);

          // check if notifications are enabled for the channel
          if (enabledChannelNotifications.indexOf(channelName) > -1) {
            uris.forEach(uri => {
              Lbry.resolve({ urls: uri }).then(result => {
                const sub = result[uri].claim;
                if (sub && sub.value && sub.value.stream) {
                  let isPlayable = false;
                  const source = sub.value.stream.source;
                  const metadata = sub.value.stream.metadata;
                  if (source) {
                    isPlayable =
                      source.contentType && ['audio', 'video'].indexOf(source.contentType.substring(0, 5)) > -1;
                  }
                  if (metadata) {
                    utility.showNotificationForContent(
                      uri,
                      metadata.title,
                      channelName,
                      metadata.thumbnail,
                      isPlayable
                    );
                  }
                }
              });
            });
          }
        });
      }
    }
  }

  showRatingReminder = () => {
    const { ratingReminderDisabled, ratingReminderLastShown, setClientSetting } = this.props;

    const now = moment().unix();
    if (ratingReminderDisabled !== 'true' && ratingReminderLastShown) {
      const lastShownParts = ratingReminderLastShown.split('|');
      if (lastShownParts.length === 2) {
        const lastShownTime = parseInt(lastShownParts[0], 10);
        const lastShownCount = parseInt(lastShownParts[1], 10);
        if (!isNaN(lastShownTime) && !isNaN(lastShownCount)) {
          if (now > lastShownTime + Constants.RATING_REMINDER_INTERVAL * lastShownCount) {
            Alert.alert(
              'Enjoying LBRY?',
              'Are you enjoying your experience with the LBRY app? You can leave a review for us on the Play Store.',
              [
                {
                  text: 'Never ask again',
                  onPress: () => setClientSetting(Constants.SETTING_RATING_REMINDER_DISABLED, 'true'),
                },
                { text: 'Maybe later', onPress: () => this.updateRatingReminderShown(lastShownCount) },
                {
                  text: 'Rate app',
                  onPress: () => {
                    setClientSetting(Constants.SETTING_RATING_REMINDER_DISABLED, 'true');
                    Linking.openURL(Constants.PLAY_STORE_URL);
                  },
                },
              ],
              { cancelable: false }
            );
          }
        }
      }
    }
    if (!ratingReminderLastShown) {
      // first time, so set a value for the next interval multiplier
      this.updateRatingReminderShown(0);
    }
  };

  updateRatingReminderShown = lastShownCount => {
    const { setClientSetting } = this.props;
    const settingString = moment().unix() + '|' + (lastShownCount + 1);
    setClientSetting(Constants.SETTING_RATING_REMINDER_LAST_SHOWN, settingString);
  };

  buildSections = () => {
    return this.state.tagCollection.map(tags => ({
      title: tags.length === 1 ? tags[0] : 'All tags you follow',
      data: [tags],
    }));
  };

  buildTagCollection = followedTags => {
    const tags = followedTags.map(tag => tag.name);

    // each of the followed tags
    const tagCollection = _.shuffle(tags)
      .slice(0, 5)
      .map(tag => [tag]);

    const usedTags = tagCollection.map(tagList => tagList[0]);
    const remainingTags = tags.filter(tag => !usedTags.includes(tag));

    // everything
    tagCollection.unshift(tags);

    this.setState({ remainingTags, tagCollection });
  };

  handleTagPress = name => {
    const { navigation, sortByItem } = this.props;
    if (name.toLowerCase() !== 'all tags you follow') {
      navigation.navigate({
        routeName: Constants.DRAWER_ROUTE_TAG,
        key: `tagPage`,
        params: {
          tag: name,
        },
      });
    } else {
      // navigate to the trending page
      navigation.navigate({ routeName: Constants.DRAWER_ROUTE_TRENDING, params: { filterForTags: true } });
    }
  };

  sectionListHeader = () => {
    const { sortByItem, timeItem } = this.props;
    return (
      <View style={discoverStyle.listHeader}>
        <View style={discoverStyle.titleRow}>
          <Text style={discoverStyle.pageTitle}>Your tags</Text>
        </View>
        <View style={discoverStyle.pickerRow}>
          <View style={discoverStyle.leftPickerRow}>
            <TouchableOpacity style={discoverStyle.tagSortBy} onPress={() => this.setState({ showSortPicker: true })}>
              <Text style={discoverStyle.tagSortText}>{sortByItem.label.split(' ')[0]}</Text>
              <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
            </TouchableOpacity>

            {Constants.SORT_BY_TOP === sortByItem.name && (
              <TouchableOpacity style={discoverStyle.tagTime} onPress={() => this.setState({ showTimePicker: true })}>
                <Text style={discoverStyle.tagSortText}>{timeItem.label}</Text>
                <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
              </TouchableOpacity>
            )}
          </View>

          <Link
            style={discoverStyle.customizeLink}
            text={'Customize'}
            onPress={() => this.setState({ showModalTagSelector: true })}
          />
        </View>
      </View>
    );
  };

  sectionListFooter = () => {
    const { remainingTags } = this.state;
    if (remainingTags.length === 0) {
      return null;
    }

    return (
      <View style={discoverStyle.footer}>
        <Text style={discoverStyle.footerTitle}>More tags you follow</Text>
        <View style={discoverStyle.footerTags}>
          {remainingTags.map(tag => (
            <Text
              key={tag}
              style={[discoverStyle.categoryName, discoverStyle.footerTag]}
              onPress={() => this.handleTagPress(tag)}
            >
              {formatTagTitle(tag)}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  renderSectionListItem = ({ item, index, section }) => (
    <ClaimList
      key={item.sort().join(',')}
      orderBy={this.state.orderBy}
      time={this.props.timeItem.name}
      tags={item}
      morePlaceholder
      navigation={this.props.navigation}
      orientation={Constants.ORIENTATION_HORIZONTAL}
    />
  );

  renderSectionHeader = ({ section: { title } }) => (
    <View style={discoverStyle.categoryTitleRow}>
      <Text style={discoverStyle.categoryName} onPress={() => this.handleTagPress(title)}>
        {formatTagTitle(title)}
      </Text>
      <TouchableOpacity onPress={() => this.handleTagPress(title)}>
        <Icon name={'angle-double-down'} size={16} />
      </TouchableOpacity>
    </View>
  );

  render() {
    const { navigation, sortByItem, timeItem } = this.props;
    const { orderBy, showModalTagSelector, showSortPicker, showTimePicker } = this.state;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} belowOverlay={showModalTagSelector} />
        <SectionList
          ListHeaderComponent={this.sectionListHeader}
          ListFooterComponent={this.sectionListFooter}
          style={discoverStyle.scrollContainer}
          contentContainerStyle={discoverStyle.scrollPadding}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          removeClippedSubviews
          renderItem={this.renderSectionListItem}
          renderSectionHeader={this.renderSectionHeader}
          sections={this.buildSections()}
          keyExtractor={(item, index) => item}
        />
        {!showModalTagSelector && !showSortPicker && !showTimePicker && (
          <FloatingWalletBalance navigation={navigation} />
        )}
        {showModalTagSelector && (
          <ModalTagSelector
            onOverlayPress={() => this.setState({ showModalTagSelector: false })}
            onDonePress={() => this.setState({ showModalTagSelector: false })}
          />
        )}
        {showSortPicker && (
          <ModalPicker
            title={__('Sort content by')}
            onOverlayPress={() => this.setState({ showSortPicker: false })}
            onItemSelected={this.handleSortByItemSelected}
            selectedItem={sortByItem}
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
      </View>
    );
  }
}

export default DiscoverPage;
