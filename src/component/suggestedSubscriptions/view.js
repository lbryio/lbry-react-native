import React from 'react';
import { ActivityIndicator, FlatList, SectionList, Text, View } from 'react-native';
import { createNormalizedClaimSearchKey, normalizeURI } from 'lbry-redux';
import { __, navigateToUri } from 'utils/helper';
import SubscribeButton from 'component/subscribeButton';
import SuggestedSubscriptionItem from 'component/suggestedSubscriptionItem';
import Colors from 'styles/colors';
import discoverStyle from 'styles/discover';
import subscriptionsStyle from 'styles/subscriptions';
import Link from 'component/link';
import _ from 'lodash';

class SuggestedSubscriptions extends React.PureComponent {
  state = {
    options: {},
  };

  componentDidMount() {
    const { claimSearch, followedTags } = this.props;
    const options = {
      any_tags: followedTags.map(tag => tag.name),
      page: 1,
      no_totals: true,
      claim_type: 'channel',
    };
    this.setState({ options });
    claimSearch(options);
  }

  buildSections = () => {
    const { suggested, claimSearchByQuery } = this.props;
    const claimSearchKey = createNormalizedClaimSearchKey(this.state.options);
    const claimSearchUris = claimSearchByQuery[claimSearchKey];

    const suggestedUris = suggested ? suggested.map(suggested => suggested.uri) : [];
    return [
      {
        title: __('You might like'),
        data: suggestedUris,
      },
      {
        title: __('Tags you follow'),
        data: claimSearchUris ? claimSearchUris.filter(uri => !suggestedUris.includes(uri)) : [],
      },
    ];
  };

  render() {
    const { suggested, loading, navigation } = this.props;

    if (loading) {
      return (
        <View style={subscriptionsStyle.centered}>
          <ActivityIndicator size="large" color={Colors.NextLbryGreen} />
        </View>
      );
    }

    return (
      <SectionList
        style={subscriptionsStyle.scrollContainer}
        contentContainerStyle={subscriptionsStyle.suggestedScrollPadding}
        renderItem={({ item, index, section }) => (
          <SuggestedSubscriptionItem key={item} uri={normalizeURI(item)} navigation={navigation} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={subscriptionsStyle.suggestedSubTitle}>{title}</Text>
        )}
        sections={this.buildSections()}
        keyExtractor={(item, index) => item}
      />
    );
  }
}

export default SuggestedSubscriptions;
