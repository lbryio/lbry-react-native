import React from "react";
import NavigationActions from "react-navigation";
import { Alert, ActivityIndicator, Linking, NativeModules, SectionList, Text, View } from "react-native";
import { DEFAULT_FOLLOWED_TAGS, Lbry, normalizeURI, parseURI } from "lbry-redux";
import { formatTagTitle } from "utils/helper";
import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import CategoryList from "component/categoryList";
import ClaimList from "component/claimList";
import Constants from "constants";
import Colors from "styles/colors";
import discoverStyle from "styles/discover";
import FloatingWalletBalance from "component/floatingWalletBalance";
import UriBar from "component/uriBar";

class DiscoverPage extends React.PureComponent {
  state = {
    tagCollection: []
  };

  componentDidMount() {
    this.buildTagCollection();

    // Track the total time taken if this is the first launch
    AsyncStorage.getItem("firstLaunchTime").then(startTime => {
      if (startTime !== null && !isNaN(parseInt(startTime, 10))) {
        // We don"t need this value anymore once we"ve retrieved it
        AsyncStorage.removeItem("firstLaunchTime");

        // We know this is the first app launch because firstLaunchTime is set and it"s a valid number
        const start = parseInt(startTime, 10);
        const now = moment().unix();
        const delta = now - start;
        AsyncStorage.getItem("firstLaunchSuspended").then(suspended => {
          AsyncStorage.removeItem("firstLaunchSuspended");
          const appSuspended = suspended === "true";
          if (NativeModules.Firebase) {
            NativeModules.Firebase.track("first_run_time", {
              total_seconds: delta,
              app_suspended: appSuspended,
            });
          }
        });
      }
    });

    const { fetchRewardedContent, fetchSubscriptions, fileList } = this.props;

    fetchRewardedContent();
    fetchSubscriptions();
    fileList();

    this.showRatingReminder();
  }

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
                      source.contentType && ["audio", "video"].indexOf(source.contentType.substring(0, 5)) > -1;
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
    if ("true" !== ratingReminderDisabled && ratingReminderLastShown) {
      const lastShownParts = ratingReminderLastShown.split("|");
      if (lastShownParts.length === 2) {
        const lastShownTime = parseInt(lastShownParts[0], 10);
        const lastShownCount = parseInt(lastShownParts[1], 10);
        if (!isNaN(lastShownTime) && !isNaN(lastShownCount)) {
          if (now > lastShownTime + Constants.RATING_REMINDER_INTERVAL * lastShownCount) {
            Alert.alert(
              "Enjoying LBRY?",
              "Are you enjoying your experience with the LBRY app? You can leave a review for us on the Play Store.",
              [
                {
                  text: "Never ask again",
                  onPress: () => setClientSetting(Constants.SETTING_RATING_REMINDER_DISABLED, "true"),
                },
                { text: "Maybe later", onPress: () => this.updateRatingReminderShown(lastShownCount) },
                {
                  text: "Rate app",
                  onPress: () => {
                    setClientSetting(Constants.SETTING_RATING_REMINDER_DISABLED, "true");
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
    const settingString = moment().unix() + "|" + (lastShownCount + 1);
    setClientSetting(Constants.SETTING_RATING_REMINDER_LAST_SHOWN, settingString);
  };

  buildSections = () => {
    return this.state.tagCollection.map(tags => ({
      title: (tags.length === 1) ? tags[0] : 'Trending',
      data: [tags]
    }));
  }

  buildTagCollection = () => {
    // TODO: Use followedTags from state if present

    // each of the followed tags
    const tagCollection = DEFAULT_FOLLOWED_TAGS.map(tag => [tag]);
    // everything
    tagCollection.unshift(DEFAULT_FOLLOWED_TAGS);

    this.setState({ tagCollection });
  }
  
  formatTitle = (title) => {
    return title.charAt(0).toUpperCase() + title.substring(1);
  }
  
  handleTagPress = (name) => {
    const { navigation } = this.props;
    if ('trending' !== name.toLowerCase()) {
      navigation.navigate({ routeName: Constants.DRAWER_ROUTE_TAG, key: 'tagPage', params: { tag: name } });
    }
  }

  render() {
    const { navigation } = this.props;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} />
        <SectionList
            style={discoverStyle.scrollContainer}
            contentContainerStyle={discoverStyle.scrollPadding}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            removeClippedSubviews={true}
            renderItem={({ item, index, section }) => (
              <ClaimList key={item.join(',')} tags={item} navigation={navigation} orientation={Constants.ORIENTATION_HORIZONTAL} />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={discoverStyle.categoryName} onPress={() => this.handleTagPress(title)}>{formatTagTitle(title)}</Text>
            )}
            sections={this.buildSections()}
            keyExtractor={(item, index) => item}
          />
        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}

export default DiscoverPage;
