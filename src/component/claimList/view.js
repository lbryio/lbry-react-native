import React from 'react';
import NavigationActions from 'react-navigation';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { MATURE_TAGS, normalizeURI, createNormalizedClaimSearchKey } from 'lbry-redux';
import _ from 'lodash';
import FileItem from 'component/fileItem';
import FileListItem from 'component/fileListItem';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import claimListStyle from 'styles/claimList';
import discoverStyle from 'styles/discover';
import moment from 'moment';

const horizontalLimit = 7;
const softLimit = 500;

class ClaimList extends React.PureComponent {
  scrollView = null;

  state = {
    currentPage: 1, // initial page load is page 1
    subscriptionsView: false, // whether or not this claim list is for subscriptions
    lastPageReached: false,
  };

  componentDidMount() {
    const { channelIds } = this.props;

    if (channelIds) {
      this.setState({ subscriptionsView: true });
    }

    this.doClaimSearch();
  }

  componentDidUpdate(prevProps) {
    const {
      claimSearchByQuery: prevClaimSearchByQuery,
      orderBy: prevOrderBy,
      searchByTags,
      tags: prevTags,
      channelIds: prevChannelIds,
      time: prevTime,
      showNsfwContent,
    } = prevProps;
    const { claimSearchByQuery, orderBy, tags, channelIds, time } = this.props;

    if (
      !_.isEqual(orderBy, prevOrderBy) ||
      !_.isEqual(tags, prevTags) ||
      !_.isEqual(channelIds, prevChannelIds) ||
      time !== prevTime
    ) {
      // reset to page 1 because the order, tags or channelIds changed
      this.setState({ currentPage: 1 }, () => {
        if (this.scrollView) {
          this.scrollView.scrollToOffset({ animated: true, offset: 0 });
        }

        if (prevChannelIds && channelIds) {
          if (channelIds) {
            this.setState({ subscriptionsView: true });
          }
        } else if (tags && tags.length > 0) {
          this.setState({ subscriptionsView: false });
        }

        this.doClaimSearch();
      });
    }
  }

  buildClaimSearchOptions() {
    const { orderBy = Constants.DEFAULT_ORDER_BY, channelIds, showNsfwContent, tags, time } = this.props;
    const { currentPage, subscriptionsView } = this.state;

    const options = {
      order_by: orderBy,
      no_totals: true,
      page: currentPage,
      page_size: Constants.DEFAULT_PAGE_SIZE,
    };

    if (channelIds) {
      options.channel_ids = channelIds;
    } else if (tags && tags.length > 0) {
      options.any_tags = tags;
    }
    if (!showNsfwContent) {
      options.not_tags = MATURE_TAGS;
    }

    if (orderBy && orderBy[0] === Constants.ORDER_BY_EFFECTIVE_AMOUNT && Constants.TIME_ALL !== time) {
      options.release_time = this.getReleaseTimeOption(time);
    }

    return options;
  }

  getReleaseTimeOption = time => {
    return `>${Math.floor(
      moment()
        .subtract(1, time)
        .unix()
    )}`;
  };

  doClaimSearch() {
    const { claimSearch } = this.props;
    const options = this.buildClaimSearchOptions();
    claimSearch(options);
  }

  handleVerticalEndReached = () => {
    // fetch more content
    const { claimSearchByQuery, lastPageReached } = this.props;

    const options = this.buildClaimSearchOptions();
    const claimSearchKey = createNormalizedClaimSearchKey(options);
    const uris = claimSearchByQuery[claimSearchKey];
    if (
      lastPageReached[claimSearchKey] ||
      ((uris.length > 0 && uris.length < Constants.DEFAULT_PAGE_SIZE) || uris.length >= softLimit)
    ) {
      return;
    }

    this.setState({ currentPage: this.state.currentPage + 1 }, () => this.doClaimSearch());
  };

  appendMorePlaceholder = items => {
    items.push(Constants.MORE_PLACEHOLDER);
    return items;
  };

  onMorePressed = () => {
    const { navigation, tags } = this.props;

    // tags.length > 1 means this is the Trending list
    if (tags.length === 1) {
      navigation.navigate({ routeName: Constants.DRAWER_ROUTE_TAG, key: 'tagPage', params: { tag: tags[0] } });
    } else {
      navigation.navigate({ routeName: Constants.DRAWER_ROUTE_TRENDING, params: { filterForTags: true } });
    }
  };

  renderMorePlaceholder = () => {
    return (
      <TouchableOpacity style={discoverStyle.fileItemMore} onPress={this.onMorePressed}>
        <Text style={discoverStyle.moreText}>more</Text>
        <Icon style={discoverStyle.moreIcon} name={'angle-double-down'} color={Colors.White} size={16} />
      </TouchableOpacity>
    );
  };

  verticalListEmptyComponent = () => {
    return (
      <Text style={claimListStyle.noContentText}>No content to display at this time. Please check back later.</Text>
    );
  };

  renderVerticalItem = ({ item }) => {
    const { hideChannel, navigation } = this.props;
    return (
      <FileListItem
        key={item}
        uri={item}
        hideChannel={hideChannel}
        style={claimListStyle.verticalListItem}
        navigation={navigation}
      />
    );
  };

  renderHorizontalItem = ({ item }) => {
    const { navigation } = this.props;

    return item === Constants.MORE_PLACEHOLDER ? (
      this.renderMorePlaceholder()
    ) : (
      <FileItem
        style={discoverStyle.fileItem}
        mediaStyle={discoverStyle.fileItemMedia}
        key={item}
        uri={normalizeURI(item)}
        navigation={navigation}
        showDetails
        compactView={false}
      />
    );
  };

  render() {
    const {
      ListHeaderComponent,
      loading,
      morePlaceholder,
      navigation,
      orientation = Constants.ORIENTATION_VERTICAL,
      style,
      claimSearchByQuery,
    } = this.props;
    const { subscriptionsView } = this.state;

    const options = this.buildClaimSearchOptions();
    const claimSearchKey = createNormalizedClaimSearchKey(options);
    const uris = claimSearchByQuery[claimSearchKey];

    if (Constants.ORIENTATION_VERTICAL === orientation) {
      return (
        <View style={style}>
          <FlatList
            ref={ref => {
              this.scrollView = ref;
            }}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={loading ? null : this.verticalListEmptyComponent}
            style={claimListStyle.verticalScrollContainer}
            contentContainerStyle={claimListStyle.verticalScrollPadding}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            removeClippedSubviews
            renderItem={this.renderVerticalItem}
            data={uris}
            keyExtractor={(item, index) => item}
            onEndReached={this.handleVerticalEndReached}
            onEndReachedThreshold={0.2}
          />
          {loading && (
            <View style={claimListStyle.verticalLoading}>
              <ActivityIndicator size={'small'} color={Colors.LbryGreen} />
            </View>
          )}
        </View>
      );
    }

    if (Constants.ORIENTATION_HORIZONTAL === orientation) {
      if (loading) {
        return (
          <View style={discoverStyle.listLoading}>
            <ActivityIndicator size={'small'} color={Colors.LbryGreen} />
          </View>
        );
      }

      return (
        <FlatList
          style={style || claimListStyle.horizontalScrollContainer}
          contentContainerStyle={claimListStyle.horizontalScrollPadding}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          removeClippedSubviews
          renderItem={this.renderHorizontalItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={uris ? this.appendMorePlaceholder(uris.slice(0, horizontalLimit)) : []}
          keyExtractor={(item, index) => item}
        />
      );
    }

    return null;
  }
}

export default ClaimList;
