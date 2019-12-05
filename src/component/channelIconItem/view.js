import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import Colors from 'styles/colors';
import autothumbStyle from 'styles/autothumb';
import channelIconStyle from 'styles/channelIcon';

export default class ChannelIconItem extends React.PureComponent {
  static AUTO_THUMB_STYLES = [
    autothumbStyle.autothumbPurple,
    autothumbStyle.autothumbRed,
    autothumbStyle.autothumbPink,
    autothumbStyle.autothumbIndigo,
    autothumbStyle.autothumbBlue,
    autothumbStyle.autothumbLightBlue,
    autothumbStyle.autothumbCyan,
    autothumbStyle.autothumbGreen,
    autothumbStyle.autothumbYellow,
    autothumbStyle.autothumbOrange,
    autothumbStyle.autothumbDeepPurple,
    autothumbStyle.autothumbAmber,
    autothumbStyle.autothumbLime,
    autothumbStyle.autothumbLightGreen,
    autothumbStyle.autothumbDeepOrange,
    autothumbStyle.autothumbBrown,
  ];

  state = {
    autoStyle: null,
  };

  componentWillMount() {
    this.setState({
      autoStyle:
        ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)],
    });
  }

  componentDidMount() {
    const { claim, isPlaceholder, uri, resolveUri } = this.props;
    if (!claim && !isPlaceholder) {
      resolveUri(uri);
    }
  }

  render() {
    const { claim, isPlaceholder, isResolvingUri, onPress, thumbnail, title } = this.props;
    const displayName = title || (claim ? claim.name : '');
    const substrIndex = displayName.startsWith('@') ? 1 : 0;

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
            isPlaceholder ? null : this.state.autoStyle,
          ]}
        >
          {isPlaceholder && (
            <View style={channelIconStyle.centered}>
              <Text style={channelIconStyle.placeholderText}>{__('ALL')}</Text>
            </View>
          )}
          {!isPlaceholder && thumbnail && (
            <Image style={channelIconStyle.thumbnail} resizeMode={'cover'} source={{ uri: thumbnail }} />
          )}
          {!isPlaceholder && !thumbnail && (
            <Text style={channelIconStyle.autothumbCharacter}>
              {displayName.substring(substrIndex, substrIndex + 1).toUpperCase()}
            </Text>
          )}
        </View>
        {!isPlaceholder && (
          <Text style={channelIconStyle.title} numberOfLines={1}>
            {displayName}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
}
