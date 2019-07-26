import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import Colors from 'styles/colors';
import channelIconStyle from 'styles/channelIcon';

export default class ChannelIconItem extends React.PureComponent {
  componentDidMount() {
    const { claim, isPlaceholder, uri, resolveUri } = this.props;
    if (!claim && !isPlaceholder) {
      resolveUri(uri);
    }
  }

  render() {
    const { claim, isPlaceholder, isResolvingUri, onPress, thumbnail, title } = this.props;

    return (
      <TouchableOpacity style={channelIconStyle.container} onPress={onPress}>
        {isResolvingUri && (
          <View style={channelIconStyle.centered}>
            <ActivityIndicator size={'small'} color={Colors.LbryGreen} />
          </View>
        )}
        <View
          style={[
            channelIconStyle.thumbnailContainer,
            isPlaceholder ? channelIconStyle.borderedThumbnailContainer : null,
          ]}
        >
          {isPlaceholder && (
            <View style={channelIconStyle.centered}>
              <Text style={channelIconStyle.placeholderText}>ALL</Text>
            </View>
          )}
          {!isPlaceholder && (
            <Image
              style={channelIconStyle.thumbnail}
              resizeMode={'cover'}
              source={thumbnail ? { uri: thumbnail } : require('../../assets/default_avatar.jpg')}
            />
          )}
        </View>
        {!isPlaceholder && (
          <Text style={channelIconStyle.title} numberOfLines={1}>
            {title || (claim ? claim.name : '')}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
}
