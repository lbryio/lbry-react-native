import React from 'react';
import { ActivityIndicator, FlatList, SectionList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import { navigateToUri } from 'utils/helper';
import SubscribeButton from 'component/subscribeButton';
import SuggestedSubscriptionItem from 'component/suggestedSubscriptionItem';
import Colors from 'styles/colors';
import discoverStyle from 'styles/discover';
import subscriptionsStyle from 'styles/subscriptions';
import Link from 'component/link';
import _ from 'lodash';

class SuggestedSubscriptions extends React.PureComponent {
  componentDidMount() {
    const { claimSearch, followedTags } = this.props;
    const options = {
      any_tags: _.shuffle(followedTags.map(tag => tag.name)).slice(0, 2),
      page: 1,
      no_totals: true,
      claim_type: 'channel',
    };
    claimSearch(options);
  }

  buildSections = () => {
    const { suggested, claimSearchUris } = this.props;
    const suggestedUris = suggested ? suggested.map(suggested => suggested.uri) : [];
    return [
      {
        title: 'You might like',
        data: suggestedUris,
      },
      {
        title: 'Tags you follow',
        data: claimSearchUris ? claimSearchUris.filter(uri => !suggestedUris.includes(uri)) : [],
      },
    ];
  };

  render() {
    const { suggested, loading, claimSearchLoading, navigation } = this.props;

    if (loading || claimSearchLoading) {
      return (
        <View style={subscriptionsStyle.centered}>
          <ActivityIndicator size="large" color={Colors.LbryGreen} />
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
