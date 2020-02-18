import React from 'react';
import { buildURI, normalizeURI } from 'lbry-redux';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { navigateToUri } from 'utils/helper';
import Colors from 'styles/colors';
import ChannelIconItem from 'component/channelIconItem';
import channelIconStyle from 'styles/channelIcon';
import discoverStyle from 'styles/discover';
import FileItem from 'component/fileItem';
import SubscribeButtonOverlay from 'component/subscribeButtonOverlay';
import subscriptionsStyle from 'styles/subscriptions';
import Link from 'component/link';
import Tag from 'component/tag';

class SuggestedSubscriptionItem extends React.PureComponent {
  state = {
    autoStyle: null,
  };

  componentDidMount() {
    const { claim, uri, resolveUri } = this.props;
    if (!claim) {
      resolveUri(uri);
    }

    this.setState({
      autoStyle:
        ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)],
    });
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

    const hasThumbnail = !!thumbnail;
    if (isResolvingUri) {
      return (
        <View style={subscriptionsStyle.itemLoadingContainer}>
          <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
        </View>
      );
    }

    return (
      <TouchableOpacity style={subscriptionsStyle.suggestedItem}>
        <View style={[subscriptionsStyle.suggestedItemThumbnailContainer, this.state.autoStyle]}>
          {hasThumbnail && (
            <Image style={subscriptionsStyle.suggestedItemThumbnail} resizeMode={'cover'} source={{ uri: thumbnail }} />
          )}
          {!hasThumbnail && (
            <Text style={channelIconStyle.autothumbCharacter}>
              {title ? title.substring(0, 1).toUpperCase() : claim ? claim.name.substring(1, 2).toUpperCase() : ''}
            </Text>
          )}
        </View>

        <View style={subscriptionsStyle.suggestedItemDetails}>
          <Text style={subscriptionsStyle.suggestedItemTitle} numberOfLines={1}>
            {title || claim.name}
          </Text>
          {tags && (
            <View style={subscriptionsStyle.suggestedItemTagList}>
              {tags &&
                tags
                  .slice(0, 1)
                  .map(tag => (
                    <Tag style={subscriptionsStyle.tag} key={tag} name={tag} navigation={navigation} truncate />
                  ))}
            </View>
          )}
        </View>

        {claim && (
          <SubscribeButtonOverlay
            claim={claim}
            style={subscriptionsStyle.suggestedItemSubscribeOverlay}
            uri={normalizeURI(claim.permanent_url)}
          />
        )}
      </TouchableOpacity>
    );
  }
}

export default SuggestedSubscriptionItem;
