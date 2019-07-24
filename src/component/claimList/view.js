import React from 'react';
import NavigationActions from 'react-navigation';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { MATURE_TAGS, normalizeURI } from 'lbry-redux';
import _ from 'lodash';
import FileItem from 'component/fileItem';
import FileListItem from 'component/fileListItem';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import claimListStyle from 'styles/claimList';
import discoverStyle from 'styles/discover';

const horizontalLimit = 10;
const softLimit = 500;

class ClaimList extends React.PureComponent {
  scrollView = null;

  state = {
    currentPage: 1, // initial page load is page 1
    subscriptionsView: false, // whether or not this claim list is for subscriptions
    trendingForAllView: false,
  };

  componentDidMount() {
    const {
      channelIds,
      trendingForAll,
      claimSearch,
      orderBy = Constants.DEFAULT_ORDER_BY,
      searchByTags,
      tags,
    } = this.props;
    if (channelIds || trendingForAll) {
      const options = {
        order_by: orderBy,
        no_totals: true,
        not_tags: MATURE_TAGS,
        page: this.state.currentPage,
      };
      if (channelIds) {
        this.setState({ subscriptionsView: true });
        options.channel_ids = channelIds;
      }
      if (trendingForAll) {
        this.setState({ trendingForAllView: true });
      }

      claimSearch(options);
    } else if (tags && tags.length > 0) {
      searchByTags(tags, orderBy, this.state.currentPgae);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      claimSearch,
      orderBy: prevOrderBy,
      searchByTags,
      tags: prevTags,
      channelIds: prevChannelIds,
      trendingForAll: prevTrendingForAll,
    } = this.props;
    const { orderBy, tags, channelIds, trendingForAll } = nextProps;
    if (
      !_.isEqual(orderBy, prevOrderBy) ||
      !_.isEqual(tags, prevTags) ||
      !_.isEqual(channelIds, prevChannelIds) ||
      trendingForAll !== prevTrendingForAll
    ) {
      // reset to page 1 because the order, tags or channelIds changed
      this.setState({ currentPage: 1 }, () => {
        if (this.scrollView) {
          this.scrollView.scrollToOffset({ animated: true, offset: 0 });
        }
        if (trendingForAll || (prevChannelIds && channelIds)) {
          const options = {
            order_by: orderBy,
            no_totals: true,
            not_tags: MATURE_TAGS,
            page: this.state.currentPage,
          };
          if (channelIds) {
            this.setState({ subscriptionsView: true });
            options.channel_ids = channelIds;
          }
          if (trendingForAll) {
            this.setState({ trendingForAllView: true });
          }

          claimSearch(options);
        } else if (tags && tags.length > 0) {
          this.setState({ subscriptionsView: false, trendingForAllView: false });
          searchByTags(tags, orderBy, this.state.currentPage);
        }
      });
    }
  }

  handleVerticalEndReached = () => {
    // fetch more content
    const { channelIds, claimSearch, claimSearchUris, orderBy, searchByTags, tags, uris } = this.props;
    const { subscriptionsView, trendingForAllView } = this.state;
    if ((claimSearchUris && claimSearchUris.length >= softLimit) || (uris && uris.length >= softLimit)) {
      // don't fetch more than the specified limit to be displayed
      return;
    }

    this.setState({ currentPage: this.state.currentPage + 1 }, () => {
      if (subscriptionsView || trendingForAllView) {
        const options = {
          order_by: orderBy,
          no_totals: true,
          not_tags: MATURE_TAGS,
          page: this.state.currentPage,
        };
        if (subscriptionsView) {
          options.channel_ids = channelIds;
        }

        claimSearch(options);
      } else {
        searchByTags(tags, orderBy, this.state.currentPage);
      }
    });
  };

  render() {
    const {
      ListHeaderComponent,
      loading,
      claimSearchLoading,
      claimSearchUris,
      navigation,
      orientation = Constants.ORIENTATION_VERTICAL,
      style,
      uris,
    } = this.props;
    const { subscriptionsView, trendingForAllView } = this.state;

    if (Constants.ORIENTATION_VERTICAL === orientation) {
      const data = subscriptionsView || trendingForAllView ? claimSearchUris : uris;
      return (
        <View style={style}>
          <FlatList
            ref={ref => {
              this.scrollView = ref;
            }}
            ListHeaderComponent={ListHeaderComponent}
            style={claimListStyle.verticalScrollContainer}
            contentContainerStyle={claimListStyle.verticalScrollPadding}
            initialNumToRender={8}
            maxToRenderPerBatch={24}
            removeClippedSubviews
            renderItem={({ item }) => (
              <FileListItem key={item} uri={item} style={claimListStyle.verticalListItem} navigation={navigation} />
            )}
            data={data}
            keyExtractor={(item, index) => item}
            onEndReached={this.handleVerticalEndReached}
            onEndReachedThreshold={0.9}
          />
          {(((subscriptionsView || trendingForAllView) && claimSearchLoading) || loading) && (
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
          renderItem={({ item }) => (
            <FileItem
              style={discoverStyle.fileItem}
              mediaStyle={discoverStyle.fileItemMedia}
              key={item}
              uri={normalizeURI(item)}
              navigation={navigation}
              showDetails
              compactView={false}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={uris ? uris.slice(0, horizontalLimit) : []}
          keyExtractor={(item, index) => item}
        />
      );
    }

    return null;
  }
}

export default ClaimList;
