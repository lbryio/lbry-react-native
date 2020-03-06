import React from 'react';
import { ActivityIndicator, SectionList, Text, View } from 'react-native';
import { MATURE_TAGS, createNormalizedClaimSearchKey, normalizeURI } from 'lbry-redux';
import { navigateToUri } from 'utils/helper';
import { FlatGrid } from 'react-native-super-grid';
import SubscribeButton from 'component/subscribeButton';
import SuggestedSubscriptionItem from 'component/suggestedSubscriptionItem';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import discoverStyle from 'styles/discover';
import subscriptionsStyle from 'styles/subscriptions';
import Link from 'component/link';
import _ from 'lodash';

const suggestedPageSize = 24;
const softLimit = 2400;
class SuggestedSubscriptionsGrid extends React.PureComponent {
  state = {
    currentPage: 1,
    options: {},
    // maintain a local state of subscriptions so that changes don't affect the search
    subscriptionIds: [],
  };

  buildClaimSearchOptions() {
    const { showNsfwContent } = this.props;
    const { currentPage } = this.state;

    const options = {
      no_totals: true,
      page: currentPage,
      page_size: suggestedPageSize,
      claim_type: 'channel',
      order_by: [Constants.ORDER_BY_EFFECTIVE_AMOUNT],
    };
    if (!showNsfwContent) {
      options.not_tags = MATURE_TAGS;
    }
    if (this.state.subscriptionIds.length > 0) {
      options.not_channel_ids = this.state.subscriptionIds;
    }

    return options;
  }

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
      ((uris.length > 0 && uris.length < suggestedPageSize) || uris.length >= softLimit)
    ) {
      return;
    }

    this.setState({ currentPage: this.state.currentPage + 1 }, () => this.doClaimSearch());
  };

  componentDidMount() {
    const { claimSearch, followedTags, showNsfwContent, subscriptions } = this.props;
    if (subscriptions && subscriptions.length > 0) {
      this.setState(
        {
          subscriptionIds: subscriptions.map(subscription => subscription.uri.split('#')[1]),
        },
        () => this.doClaimSearch(),
      );
    } else {
      this.doClaimSearch();
    }
  }

  render() {
    const { claimSearchByQuery, suggested, inModal, navigation } = this.props;
    const options = this.buildClaimSearchOptions();
    const claimSearchKey = createNormalizedClaimSearchKey(options);
    const claimSearchUris = claimSearchByQuery[claimSearchKey];

    return (
      <FlatGrid
        initialNumToRender={24}
        maxToRenderPerBatch={48}
        removeClippedSubviews
        itemDimension={120}
        spacing={2}
        items={claimSearchUris}
        style={inModal ? subscriptionsStyle.modalScrollContainer : subscriptionsStyle.scrollContainer}
        contentContainerStyle={
          inModal ? subscriptionsStyle.modalSuggestedScrollContent : subscriptionsStyle.suggestedScrollContent
        }
        renderItem={({ item, index }) => (
          <SuggestedSubscriptionItem key={item} uri={normalizeURI(item)} navigation={navigation} />
        )}
        onEndReached={this.handleVerticalEndReached}
        onEndReachedThreshold={0.2}
      />
    );
  }
}

export default SuggestedSubscriptionsGrid;
