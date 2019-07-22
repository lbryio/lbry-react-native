import React from 'react';
import NavigationActions from 'react-navigation';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import _ from 'lodash';
import FileItem from 'component/fileItem';
import FileListItem from 'component/fileListItem';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import claimListStyle from 'styles/claimList';
import discoverStyle from 'styles/discover';

const softLimit = 500;

class ClaimList extends React.PureComponent {
  scrollView = null;

  state = {
    currentPage: 1, // initial page load is page 1
    subscriptionsView: false, // whether or not this claim list is for subscriptions
  };

  componentDidMount() {
    const { channelIds, claimSearch, orderBy = Constants.DEFAULT_ORDER_BY, searchByTags, tags } = this.props;
    if (channelIds) {
      this.setState({ subscriptionsView: true });
      claimSearch({
        order_by: orderBy,
        channel_ids: channelIds,
        no_totals: true,
        page: this.state.currentPage,
      });
    } else if (tags && tags.length > 0) {
      searchByTags(tags, orderBy, this.state.currentPgae);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { claimSearch, orderBy: prevOrderBy, searchByTags, tags: prevTags, channelIds: prevChannelIds } = this.props;
    const { orderBy, tags, channelIds } = nextProps;
    if (!_.isEqual(orderBy, prevOrderBy) || !_.isEqual(tags, prevTags) || !_.isEqual(channelIds, prevChannelIds)) {
      // reset to page 1 because the order, tags or channelIds changed
      this.setState({ currentPage: 1 }, () => {
        if (this.scrollView) {
          this.scrollView.scrollToOffset({ animated: true, offset: 0 });
        }
        if (prevChannelIds && channelIds) {
          claimSearch({
            order_by: orderBy,
            channel_ids: channelIds,
            no_totals: true,
            page: this.state.currentPage,
          });
        } else if (tags && tags.length > 0) {
          searchByTags(tags, orderBy, this.state.currentPage);
        }
      });
    }
  }

  handleVerticalEndReached = () => {
    // fetch more content
    const { channelIds, claimSearch, claimSearchUris, orderBy, searchByTags, tags, uris } = this.props;
    const { subscriptionsView } = this.state;
    if ((claimSearchUris && claimSearchUris.length >= softLimit) || (uris && uris.length >= softLimit)) {
      // don't fetch more than the specified limit to be displayed
      return;
    }

    this.setState({ currentPage: this.state.currentPage + 1 }, () => {
      if (subscriptionsView) {
        claimSearch({
          order_by: orderBy,
          channel_ids: channelIds,
          no_totals: true,
          page: this.state.currentPage,
        });
      } else {
        searchByTags(tags, orderBy, this.state.currentPage);
      }
    });
  };

  render() {
    const {
      loading,
      claimSearchLoading,
      claimSearchUris,
      navigation,
      orientation = Constants.ORIENTATION_VERTICAL,
      style,
      uris,
    } = this.props;
    const { subscriptionsView } = this.state;

    if (Constants.ORIENTATION_VERTICAL === orientation) {
      return (
        <View style={style}>
          <FlatList
            ref={ref => {
              this.scrollView = ref;
            }}
            style={claimListStyle.verticalScrollContainer}
            contentContainerStyle={claimListStyle.verticalScrollPadding}
            initialNumToRender={8}
            maxToRenderPerBatch={24}
            removeClippedSubviews
            renderItem={({ item }) => (
              <FileListItem key={item} uri={item} style={claimListStyle.verticalListItem} navigation={navigation} />
            )}
            data={subscriptionsView ? claimSearchUris : uris}
            keyExtractor={(item, index) => item}
            onEndReached={this.handleVerticalEndReached}
            onEndReachedThreshold={0.9}
          />
          {((subscriptionsView && claimSearchLoading) || loading) && (
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
          data={uris}
          keyExtractor={(item, index) => item}
        />
      );
    }

    return null;
  }
}

export default ClaimList;
