import React from 'react';
import { normalizeURI, parseURI } from 'lbry-redux';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { navigateToUri } from 'utils/helper';
import Colors from 'styles/colors';
import ChannelIconItem from 'component/channelIconItem';
import channelIconStyle from 'styles/channelIcon';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import DateTime from 'component/dateTime';
import FastImage from 'react-native-fast-image';
import FileItemMedia from 'component/fileItemMedia';
import FilePrice from 'component/filePrice';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import NsfwOverlay from 'component/nsfwOverlay';
import ProgressBar from 'component/progressBar';
import editorsChoiceStyle from 'styles/editorsChoice';

class EditorsChoiceItem extends React.PureComponent {
  componentDidMount() {
    const { claim, resolveUri, uri, batchResolve } = this.props;
    if (!claim && !batchResolve) {
      resolveUri(uri);
    }
  }

  defaultOnPress = () => {
    const { autoplay, claim, navigation, uri } = this.props;
    navigateToUri(navigation, uri, { autoplay }, false, claim ? claim.permanent_url : null);
  };

  onPressHandler = () => {
    const { claim, onPress } = this.props;
    if (onPress) {
      onPress(claim);
    } else {
      this.defaultOnPress();
    }
  };

  render() {
    const { metadata, title, thumbnail } = this.props;

    return (
      <TouchableOpacity style={editorsChoiceStyle.item}>
        <Text style={editorsChoiceStyle.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={editorsChoiceStyle.itemRow}>
          <FastImage
            style={editorsChoiceStyle.thumbnail}
            resizeMode={FastImage.resizeMode.cover}
            source={{ uri: thumbnail }}
          />

          <View style={editorsChoiceStyle.detailsContainer}>
            <Text style={editorsChoiceStyle.description} numberOfLines={5}>
              {metadata.description ? metadata.description : __('No description available')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

export default EditorsChoiceItem;
