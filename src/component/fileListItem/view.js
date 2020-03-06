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

class FileListItem extends React.PureComponent {
  state = {
    autoStyle: null,
    url: null,
  };

  getDownloadProgress = fileInfo => {
    return Math.ceil((fileInfo.written_bytes / fileInfo.total_bytes) * 100);
  };

  componentDidMount() {
    const { claim, resolveUri, uri, batchResolve } = this.props;
    if (!claim && !batchResolve) {
      resolveUri(uri);
    }

    this.setState({
      autoStyle:
        ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)],
    });
  }

  componentDidUpdate() {
    const { claim, resolveUri, uri, batchResolve } = this.props;
    if (!claim && uri !== this.state.url && !batchResolve) {
      this.setState({ url: uri }, () => resolveUri(uri));
    }
  }

  defaultOnPress = () => {
    const { autoplay, claim, featuredResult, navigation, uri, shortUrl } = this.props;

    if (featuredResult && !claim) {
      navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH, params: { vanityUrl: uri.trim() } });
    } else {
      navigateToUri(navigation, shortUrl || uri, { autoplay }, false, claim ? claim.permanent_url : null);
    }
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
    const {
      blackListedOutpoints,
      claim,
      fileInfo,
      filteredOutpoints,
      metadata,
      nsfw,
      featuredResult,
      isResolvingUri,
      isDownloaded,
      style,
      obscureNsfw,
      onPress,
      navigation,
      rewardedContentClaimIds,
      setPlayerVisible,
      thumbnail,
      hideChannel,
      onLongPress,
      selected,
      title,
    } = this.props;

    const uri = normalizeURI(this.props.uri);
    const obscure = obscureNsfw && nsfw;
    const isResolving = !fileInfo && isResolvingUri;
    const duration = claim && claim.value && claim.value.video ? claim.value.video.duration : null;

    let name,
      channel,
      height,
      isRewardContent,
      channelClaimId,
      fullChannelUri,
      repostChannel,
      repostChannelUrl,
      shortChannelUri,
      shouldHide,
      signingChannel,
      isRepost;
    if (claim) {
      name = claim.name;
      signingChannel = claim.signing_channel;
      channel = signingChannel ? signingChannel.name : null;
      height = claim.height;
      isRewardContent = rewardedContentClaimIds.includes(claim.claim_id);
      channelClaimId = signingChannel ? signingChannel.claim_id : null;
      fullChannelUri = channelClaimId ? `${channel}#${channelClaimId}` : channel;
      shortChannelUri = signingChannel ? signingChannel.short_url : null;
      repostChannelUrl = claim.repost_channel_url;
      if (repostChannelUrl) {
        const { claimName: repostChannelName } = parseURI(repostChannelUrl);
        repostChannel = repostChannelName;
      }
      isRepost = !!repostChannelUrl;

      if (blackListedOutpoints || filteredOutpoints) {
        const outpointsToHide = !blackListedOutpoints
          ? filteredOutpoints
          : blackListedOutpoints.concat(filteredOutpoints);
        shouldHide = outpointsToHide.some(outpoint => outpoint.txid === claim.txid && outpoint.nout === claim.nout);
      }

      // TODO: hide channels on tag pages?
      // shouldHide = 'channel' === claim.value_type;
    }

    if (shouldHide || (!isResolvingUri && !claim && !featuredResult)) {
      return null;
    }

    const actualHideChannel = !isRepost && hideChannel;
    const isChannel = name && name.startsWith('@');
    const hasThumbnail = !!thumbnail;
    return (
      <View>
        {isRepost && (
          <View style={fileListStyle.repostInfo}>
            <Icon name={"retweet"} size={14} style={fileListStyle.repostIcon} />
            <Text style={fileListStyle.repostChannelName}>
              <Link text={repostChannel}
                onPress={() => navigateToUri(navigation, normalizeURI(repostChannelUrl), null, false, null, false)} /> reposted</Text>
          </View>
        )}

        <TouchableOpacity
          style={[style, isChannel ? fileListStyle.channelContainer : null]}
          onPress={this.onPressHandler}
          onLongPress={() => {
            if (onLongPress) {
              onLongPress(claim);
            }
          }}
        >
          {!isChannel && (
            <FileItemMedia
              style={fileListStyle.thumbnail}
              duration={duration}
              resizeMode="cover"
              title={title || name || normalizeURI(uri).substring(7)}
              thumbnail={thumbnail}
            />
          )}

          {isChannel && (
            <View style={fileListStyle.channelThumbnailView}>
              <View style={[fileListStyle.channelThumbnailContainer, this.state.autoStyle]}>
                {hasThumbnail && (
                  <FastImage
                    style={fileListStyle.channelThumbnail}
                    resizeMode={FastImage.resizeMode.cover}
                    source={{ uri: thumbnail }}
                  />
                )}
                {!hasThumbnail && (
                  <Text style={channelIconStyle.autothumbCharacter}>
                    {title ? title.substring(0, 1).toUpperCase() : claim.name.substring(1, 2).toUpperCase()}
                  </Text>
                )}
              </View>
            </View>
          )}

          {selected && (
            <View style={fileListStyle.selectedOverlay}>
              <Icon name={'check-circle'} solid color={Colors.NextLbryGreen} size={32} />
            </View>
          )}
          {fileInfo && fileInfo.completed && fileInfo.download_path && (
            <Icon
              style={featuredResult ? fileListStyle.featuredDownloadedIcon : fileListStyle.downloadedIcon}
              solid
              color={Colors.NextLbryGreen}
              name={'folder'}
              size={16}
            />
          )}
          <FilePrice
            uri={uri}
            style={fileListStyle.filePriceContainer}
            iconStyle={fileListStyle.filePriceIcon}
            textStyle={fileListStyle.filePriceText}
          />
          <View style={fileListStyle.detailsContainer}>
            {featuredResult && (
              <Text style={fileListStyle.featuredUri} numberOfLines={1}>
                {uri}
              </Text>
            )}

            {!title && !name && !channel && isResolving && (
              <View>
                {!title && !name && <Text style={fileListStyle.uri}>{uri}</Text>}
                {!title && !name && (
                  <View style={fileListStyle.row}>
                    <ActivityIndicator size={'small'} color={featuredResult ? Colors.White : Colors.NextLbryGreen} />
                  </View>
                )}
              </View>
            )}

            {(title || name) && (
              <View style={fileListStyle.titleContainer}>
                <Text
                  style={featuredResult ? fileListStyle.featuredTitle : fileListStyle.title}
                  numberOfLines={actualHideChannel ? 4 : 3}
                >
                  {title || name}
                </Text>
                {isRewardContent && <Icon style={fileListStyle.rewardIcon} name="award" size={12} />}
              </View>
            )}

            {featuredResult && !isResolving && !claim && (
              <View style={fileListStyle.titleContainer}>
                <Text style={fileListStyle.featuredTitle}>{__('Nothing here. Publish something!')}</Text>
              </View>
            )}

            {(channel || isChannel) && !actualHideChannel && (
              <Link
                style={fileListStyle.publisher}
                text={isChannel ? name : channel}
                onPress={() => {
                  navigateToUri(
                    navigation,
                    normalizeURI(isChannel ? uri : shortChannelUri || fullChannelUri),
                    null,
                    false,
                    isChannel ? claim && claim.permanent_url : fullChannelUri,
                    setPlayerVisible,
                  );
                }}
              />
            )}

            <View style={fileListStyle.info}>
              {fileInfo && !isNaN(fileInfo.written_bytes) && fileInfo.written_bytes > 0 && (
                <Text style={fileListStyle.infoText}>{getStorageForFileInfo(fileInfo)}</Text>
              )}
              <DateTime style={fileListStyle.publishInfo} textStyle={fileListStyle.infoText} timeAgo uri={uri} />
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

export default FileListItem;
