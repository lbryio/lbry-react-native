import React from 'react';
import { normalizeURI, parseURI } from 'lbry-redux';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { navigateToUri, getDownloadProgress, getStorageForFileInfo } from 'utils/helper';
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
import fileListStyle from 'styles/fileList';
import seedrandom from 'seedrandom';

class ClaimResultItem extends React.PureComponent {
  state = {
    autoStyle: null,
  };

  componentDidMount() {
    const { result } = this.props;

    if (!result || !result.name || !result.claimId) {
      this.setState({
        autoStyle:
          ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)],
      });
    } else {
      // result property set, use deterministic random style
      const rng = seedrandom(normalizeURI(`${result.name}#${result.claimId}`));
      const index = Math.floor(rng.quick() * ChannelIconItem.AUTO_THUMB_STYLES.length);
      this.setState({ autoStyle: ChannelIconItem.AUTO_THUMB_STYLES[index] });
    }
  }

  onPressHandler = () => {
    const { autoplay, navigation, result } = this.props;
    const { claimId, name } = result;
    const url = normalizeURI(`${name}#${claimId}`);
    navigateToUri(navigation, url, { autoplay }, false, url);
  };

  render() {
    const { fileInfo, navigation, obscureNsfw, result, rewardedContentClaimIds, style } = this.props;
    const {
      channel,
      channel_claim_id: channelClaimId,
      claimId,
      duration,
      fee,
      name,
      nsfw,
      release_time: releaseTime,
      thumbnail_url: thumbnailUrl,
      title,
    } = result;

    const isChannel = name && name.startsWith('@');
    const hasThumbnail = !!thumbnailUrl;
    const obscure = obscureNsfw && nsfw;
    const url = normalizeURI(`${name}#${claimId}`);
    const hasChannel = !!channel;
    const channelUrl = hasChannel ? normalizeURI(`${channel}#${channelClaimId}`) : null;
    const isRewardContent = rewardedContentClaimIds.includes(claimId);

    return (
      <View style={style}>
        <TouchableOpacity
          style={[style, isChannel ? fileListStyle.channelContainer : null]}
          onPress={this.onPressHandler}
        >
          {!isChannel && (
            <FileItemMedia
              style={fileListStyle.thumbnail}
              duration={duration}
              resizeMode="cover"
              title={title || name || normalizeURI(url).substring(7)}
              thumbnail={thumbnailUrl}
            />
          )}

          {isChannel && (
            <View style={fileListStyle.channelThumbnailView}>
              <View style={[fileListStyle.channelThumbnailContainer, this.state.autoStyle]}>
                {hasThumbnail && (
                  <FastImage
                    style={fileListStyle.channelThumbnail}
                    resizeMode={FastImage.resizeMode.cover}
                    source={{ uri: thumbnailUrl }}
                  />
                )}
                {!hasThumbnail && (
                  <Text style={channelIconStyle.autothumbCharacter}>
                    {title ? title.substring(0, 1).toUpperCase() : name.substring(1, 2).toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
          )}

          {fileInfo && fileInfo.completed && fileInfo.download_path && (
            <Icon style={fileListStyle.downloadedIcon} solid color={Colors.NextLbryGreen} name={'folder'} size={16} />
          )}
          <FilePrice
            cost={fee ? parseFloat(fee) / 100000000 : 0}
            uri={url}
            style={fileListStyle.filePriceContainer}
            iconStyle={fileListStyle.filePriceIcon}
            textStyle={fileListStyle.filePriceText}
          />
          <View style={fileListStyle.detailsContainer}>
            {(title || name) && (
              <View style={fileListStyle.titleContainer}>
                <Text style={fileListStyle.title} numberOfLines={3}>
                  {title || name}
                </Text>
                {isRewardContent && <Icon style={fileListStyle.rewardIcon} name="award" size={12} />}
              </View>
            )}

            {(hasChannel || isChannel) && (
              <Link
                style={fileListStyle.publisher}
                text={isChannel ? name : channel}
                onPress={() => {
                  navigateToUri(
                    navigation,
                    normalizeURI(isChannel ? url : channelUrl),
                    null,
                    false,
                    isChannel ? url : channelUrl,
                  );
                }}
              />
            )}

            <View style={fileListStyle.info}>
              {fileInfo && !isNaN(fileInfo.written_bytes) && fileInfo.written_bytes > 0 && (
                <Text style={fileListStyle.infoText}>{getStorageForFileInfo(fileInfo)}</Text>
              )}
              <DateTime
                style={fileListStyle.publishInfo}
                textStyle={fileListStyle.infoText}
                timeAgo
                date={releaseTime}
              />
            </View>

            {fileInfo && fileInfo.download_path && (
              <View style={fileListStyle.downloadInfo}>
                {!fileInfo.completed && (
                  <ProgressBar
                    borderRadius={3}
                    color={Colors.NextLbryGreen}
                    height={3}
                    style={fileListStyle.progress}
                    progress={getDownloadProgress(fileInfo)}
                  />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
        {obscure && <NsfwOverlay onPress={() => navigation.navigate({ routeName: 'Settings', key: 'settingsPage' })} />}
      </View>
    );
  }
}

export default ClaimResultItem;
