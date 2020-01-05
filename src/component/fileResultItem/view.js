import React from 'react';
import { normalizeURI, parseURI } from 'lbry-redux';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { navigateToUri, formatBytes } from 'utils/helper';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import DateTime from 'component/dateTime';
import FileItemMedia from 'component/fileItemMedia';
import FilePrice from 'component/filePrice';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import NsfwOverlay from 'component/nsfwOverlay';
import ProgressBar from 'component/progressBar';
import fileListStyle from 'styles/fileList';

class FileResultItem extends React.PureComponent {
  getStorageForFileInfo = fileInfo => {
    if (!fileInfo.completed) {
      const written = formatBytes(fileInfo.written_bytes);
      const total = formatBytes(fileInfo.total_bytes);
      return `(${written} / ${total})`;
    }

    return formatBytes(fileInfo.written_bytes);
  };

  formatTitle = title => {
    if (!title) {
      return title;
    }

    return title.length > 80 ? title.substring(0, 77).trim() + '...' : title;
  };

  getDownloadProgress = fileInfo => {
    return Math.ceil((fileInfo.written_bytes / fileInfo.total_bytes) * 100);
  };

  onPressHandler = () => {
    const { autoplay, navigation, result } = this.props;
    const { claimId, name } = result;
    const url = normalizeURI(`${name}#${claimId}`);
    navigateToUri(navigation, url, { autoplay }, false, url);
  };

  render() {
    const { featuredResult, fileInfo, navigation, obscureNsfw, result, rewardedContentClaimIds, style } = this.props;
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

    const obscure = obscureNsfw && nsfw;
    const url = normalizeURI(`${name}#${claimId}`);
    const hasChannel = !!channel;
    const channelUrl = channel ? normalizeURI(`${channel}#${channelClaimId}`) : null;
    const isRewardContent = rewardedContentClaimIds.includes(claimId);

    return (
      <View style={style}>
        <TouchableOpacity style={style} onPress={this.onPressHandler}>
          <FileItemMedia
            style={fileListStyle.thumbnail}
            duration={duration}
            resizeMode="cover"
            title={title || name || normalizeURI(url).substring(7)}
            thumbnail={thumbnailUrl}
          />
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
            cost={fee ? parseFloat(fee) / 100000000 : 0}
            uri={url}
            style={fileListStyle.filePriceContainer}
            iconStyle={fileListStyle.filePriceIcon}
            textStyle={fileListStyle.filePriceText}
          />
          <View style={fileListStyle.detailsContainer}>
            {(title || name) && (
              <View style={fileListStyle.titleContainer}>
                <Text style={featuredResult ? fileListStyle.featuredTitle : fileListStyle.title}>
                  {this.formatTitle(title) || this.formatTitle(name)}
                </Text>
                {isRewardContent && <Icon style={fileListStyle.rewardIcon} name="award" size={12} />}
              </View>
            )}

            {hasChannel && (
              <Link
                style={fileListStyle.publisher}
                text={channel}
                onPress={() => {
                  navigateToUri(navigation, normalizeURI(channelUrl), null, false, channelUrl);
                }}
              />
            )}

            <View style={fileListStyle.info}>
              {fileInfo && !isNaN(fileInfo.written_bytes) && fileInfo.written_bytes > 0 && (
                <Text>{this.getStorageForFileInfo(fileInfo)}</Text>
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
                    progress={this.getDownloadProgress(fileInfo)}
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

export default FileResultItem;
