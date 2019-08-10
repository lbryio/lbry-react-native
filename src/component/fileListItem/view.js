import React from 'react';
import { normalizeURI, parseURI } from 'lbry-redux';
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from 'react-native';
import { navigateToUri, formatBytes } from 'utils/helper';
import Colors from 'styles/colors';
import DateTime from 'component/dateTime';
import FileItemMedia from 'component/fileItemMedia';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import NsfwOverlay from 'component/nsfwOverlay';
import ProgressBar from 'component/progressBar';
import fileListStyle from 'styles/fileList';

class FileListItem extends React.PureComponent {
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

  componentDidMount() {
    const { claim, resolveUri, uri } = this.props;
    if (!claim) {
      resolveUri(uri);
    }
  }

  defaultOnPress = () => {
    const { navigation, uri } = this.props;
    navigateToUri(navigation, uri);
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
      thumbnail,
      hideChannel,
      title,
    } = this.props;

    const uri = normalizeURI(this.props.uri);
    const obscure = obscureNsfw && nsfw;
    const isResolving = !fileInfo && isResolvingUri;

    let name, channel, height, channelClaimId, fullChannelUri, shouldHide, signingChannel;
    if (claim) {
      name = claim.name;
      signingChannel = claim.signing_channel;
      channel = signingChannel ? signingChannel.name : null;
      height = claim.height;
      channelClaimId = signingChannel ? signingChannel.claim_id : null;
      fullChannelUri = channelClaimId ? `${channel}#${channelClaimId}` : channel;

      if (blackListedOutpoints || filteredOutpoints) {
        const outpointsToHide = blackListedOutpoints.concat(filteredOutpoints);
        shouldHide = outpointsToHide.some(outpoint => outpoint.txid === claim.txid && outpoint.nout === claim.nout);
      }
    }

    if (shouldHide || (featuredResult && !isResolvingUri && !claim && !title && !name)) {
      return null;
    }

    return (
      <View style={style}>
        <TouchableOpacity style={style} onPress={onPress || this.defaultOnPress}>
          <FileItemMedia
            style={fileListStyle.thumbnail}
            blurRadius={obscure ? 15 : 0}
            resizeMode="cover"
            title={title || name}
            thumbnail={thumbnail}
          />
          {fileInfo && fileInfo.completed && fileInfo.download_path && (
            <Icon style={fileListStyle.downloadedIcon} solid color={Colors.NextLbryGreen} name={'folder'} size={16} />
          )}
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
                    <ActivityIndicator size={'small'} color={featuredResult ? Colors.White : Colors.LbryGreen} />
                  </View>
                )}
              </View>
            )}

            {(title || name) && (
              <Text style={featuredResult ? fileListStyle.featuredTitle : fileListStyle.title}>
                {this.formatTitle(title) || this.formatTitle(name)}
              </Text>
            )}
            {channel && !hideChannel && (
              <Link
                style={fileListStyle.publisher}
                text={channel}
                onPress={() => {
                  navigateToUri(navigation, normalizeURI(fullChannelUri));
                }}
              />
            )}

            <View style={fileListStyle.info}>
              {fileInfo && !isNaN(fileInfo.written_bytes) && fileInfo.written_bytes > 0 && (
                <Text style={fileListStyle.infoText}>{this.getStorageForFileInfo(fileInfo)}</Text>
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

export default FileListItem;
