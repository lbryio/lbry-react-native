import React from 'react';
import { buildURI, normalizeURI } from 'lbry-redux';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { navigateToUri } from 'utils/helper';
import Colors from 'styles/colors';
import discoverStyle from 'styles/discover';
import FileItem from 'component/fileItem';
import SubscribeButton from 'component/subscribeButton';
import subscriptionsStyle from 'styles/subscriptions';
import Link from 'component/link';
import Tag from 'component/tag';

class SuggestedSubscriptionItem extends React.PureComponent {
  componentDidMount() {
    const { claim, uri, resolveUri } = this.props;
    if (!claim) {
      resolveUri(uri);
    }
  }

  render() {
    const { claim, isResolvingUri, navigation, thumbnail, title, uri } = this.props;
    let shortUrl, tags;
    if (claim) {
      shortUrl = claim.short_url;
      if (claim.value) {
        tags = claim.value.tags;
      }
    }

    if (isResolvingUri) {
      return (
        <View style={subscriptionsStyle.itemLoadingContainer}>
          <ActivityIndicator size={'small'} color={Colors.LbryGreen} />
        </View>
      );
    }

    return (
      <View style={subscriptionsStyle.suggestedItem}>
        <View style={subscriptionsStyle.suggestedItemThumbnailContainer}>
          <Image
            style={subscriptionsStyle.suggestedItemThumbnail}
            resizeMode={'cover'}
            source={thumbnail ? { uri: thumbnail } : require('../../assets/default_avatar.jpg')}
          />
        </View>

        <View style={subscriptionsStyle.suggestedItemDetails}>
          {title && (
            <Text style={subscriptionsStyle.suggestedItemTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
          {claim && (
            <Link
              style={subscriptionsStyle.suggestedItemName}
              numberOfLines={1}
              text={claim.name}
              onPress={() => navigateToUri(navigation, normalizeURI(shortUrl || uri))}
            />
          )}
          {tags && (
            <View style={subscriptionsStyle.suggestedItemTagList}>
              {tags &&
                tags
                  .slice(0, 3)
                  .map(tag => (
                    <Tag style={subscriptionsStyle.tag} key={tag} name={tag} navigation={navigation} truncate />
                  ))}
            </View>
          )}
        </View>

        {claim && (
          <SubscribeButton style={subscriptionsStyle.suggestedItemSubscribe} uri={normalizeURI(claim.permanent_url)} />
        )}
      </View>
    );
  }
}

export default SuggestedSubscriptionItem;
