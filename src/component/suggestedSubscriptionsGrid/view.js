import React from 'react';
import { ActivityIndicator, SectionList, Text, View } from 'react-native';
import { MATURE_TAGS, createNormalizedClaimSearchKey, normalizeURI } from 'lbry-redux';
import { navigateToUri } from 'utils/helper';
import { FlatGrid } from 'react-native-super-grid';
import SubscribeButton from 'component/subscribeButton';
import SuggestedSubscriptionItem from 'component/suggestedSubscriptionItem';
import Colors from 'styles/colors';
import discoverStyle from 'styles/discover';
import subscriptionsStyle from 'styles/subscriptions';
import Link from 'component/link';
import _ from 'lodash';

class SuggestedSubscriptionsGrid extends React.PureComponent {
  state = {
    options: {},
  };

  componentDidMount() {
    const { claimSearch, followedTags, showNsfwContent } = this.props;
    const options = {
      page: 1,
      page_size: 99,
      no_totals: true,
      claim_type: 'channel',
      order_by: ['trending_global', 'trending_mixed'],
    };
    if (!showNsfwContent) {
      options.not_tags = MATURE_TAGS;
    }
    this.setState({ options });
    claimSearch(options);
  }

  render() {
    const { claimSearchByQuery, suggested, inModal, loading, navigation } = this.props;
    const claimSearchKey = createNormalizedClaimSearchKey(this.state.options);
    const claimSearchUris = claimSearchByQuery[claimSearchKey];

    if (loading) {
      return (
        <View style={subscriptionsStyle.centered}>
          <ActivityIndicator size="large" color={Colors.NextLbryGreen} />
        </View>
      );
    }

    return (
      <FlatGrid
        horizontal
        initialNumToRender={18}
        maxToRenderPerBatch={24}
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
      />
    );
  }
}

export default SuggestedSubscriptionsGrid;
