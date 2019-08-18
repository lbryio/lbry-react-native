import React from 'react';
import { Lbry, normalizeURI } from 'lbry-redux';
import { Lbryio } from 'lbryinc';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Dimensions,
  NativeModules,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  WebView,
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { navigateBack, navigateToUri } from 'utils/helper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ImageViewer from 'react-native-image-zoom-viewer';
import Button from 'component/button';
import Tag from 'component/tag';
import ChannelPage from 'page/channel';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import DateTime from 'component/dateTime';
import FileDownloadButton from 'component/fileDownloadButton';
import FileItemMedia from 'component/fileItemMedia';
import FilePrice from 'component/filePrice';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import Link from 'component/link';
import MediaPlayer from 'component/mediaPlayer';
import RelatedContent from 'component/relatedContent';
import SubscribeButton from 'component/subscribeButton';
import SubscribeNotificationButton from 'component/subscribeNotificationButton';
import UriBar from 'component/uriBar';
import Video from 'react-native-video';
import FileRewardsDriver from 'component/fileRewardsDriver';
import filePageStyle from 'styles/filePage';
import uriBarStyle from 'styles/uriBar';

class FilePage extends React.PureComponent {
  static navigationOptions = {
    title: '',
  };

  tipAmountInput = null;

  playerBackground = null;

  scrollView = null;

  startTime = null;

  constructor(props) {
    super(props);
    this.state = {
      autoPlayMedia: false,
      autoDownloadStarted: false,
      downloadButtonShown: false,
      downloadPressed: false,
      fileViewLogged: false,
      fullscreenMode: false,
      fileGetStarted: false,
      imageUrls: null,
      isLandscape: false,
      mediaLoaded: false,
      pageSuspended: false,
      relatedContentY: 0,
      showDescription: false,
      showImageViewer: false,
      showWebView: false,
      showTipView: false,
      playerBgHeight: 0,
      playerHeight: 0,
      tipAmount: null,
      uri: null,
      uriVars: null,
      stopDownloadConfirmed: false,
      streamingMode: false,
    };
  }

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  onComponentFocused = () => {
    StatusBar.setHidden(false);
    NativeModules.Firebase.setCurrentScreen('File');

    DeviceEventEmitter.addListener('onDownloadStarted', this.handleDownloadStarted);
    DeviceEventEmitter.addListener('onDownloadUpdated', this.handleDownloadUpdated);
    DeviceEventEmitter.addListener('onDownloadCompleted', this.handleDownloadCompleted);

    const { fileInfo, isResolvingUri, resolveUri, navigation } = this.props;
    const { uri, uriVars } = navigation.state.params;
    this.setState({ uri, uriVars });

    if (!isResolvingUri) resolveUri(uri);

    this.fetchFileInfo(this.props);
    this.fetchCostInfo(this.props);

    if (NativeModules.Firebase) {
      NativeModules.Firebase.track('open_file_page', { uri: uri });
    }
    if (NativeModules.UtilityModule) {
      NativeModules.UtilityModule.keepAwakeOn();
    }
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const {
      claim,
      currentRoute,
      failedPurchaseUris: prevFailedPurchaseUris,
      purchasedUris: prevPurchasedUris,
      navigation,
      contentType,
      notify,
    } = this.props;
    const { uri } = navigation.state.params;
    const {
      currentRoute: prevRoute,
      failedPurchaseUris,
      fileInfo,
      purchasedUris,
      purchaseUriErrorMessage,
      streamingUrl,
    } = nextProps;

    if (Constants.ROUTE_FILE === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }

    if (failedPurchaseUris.includes(uri) && !purchasedUris.includes(uri)) {
      if (purchaseUriErrorMessage && purchaseUriErrorMessage.trim().length > 0) {
        notify({ message: purchaseUriErrorMessage, isError: true });
      }
      this.setState({ downloadPressed: false, fileViewLogged: false, mediaLoaded: false });
    }

    const mediaType = Lbry.getMediaType(contentType);
    const isPlayable = mediaType === 'video' || mediaType === 'audio';
    if (
      (this.state.fileGetStarted || prevPurchasedUris.length !== purchasedUris.length) &&
      NativeModules.UtilityModule
    ) {
      if (purchasedUris.includes(uri)) {
        const { nout, txid } = claim;
        const outpoint = `${txid}:${nout}`;
        NativeModules.UtilityModule.queueDownload(outpoint);
        // If the media is playable, file/view will be done in onPlaybackStarted
        if (!isPlayable && !this.state.fileViewLogged) {
          this.logFileView(uri, claim);
        }
        this.setState({ fileGetStarted: false });
      }
      NativeModules.UtilityModule.checkDownloads();
    }

    if (!this.state.streamingMode && isPlayable) {
      if (streamingUrl) {
        this.setState({ streamingMode: true, currentStreamUrl: streamingUrl });
      } else if (fileInfo && fileInfo.streaming_url) {
        this.setState({ streamingMode: true, currentStreamUrl: fileInfo.streaming_url });
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { claim, contentType, fileInfo, isResolvingUri, resolveUri, navigation } = this.props;
    const { uri } = this.state;
    if (!isResolvingUri && claim === undefined && uri) {
      resolveUri(uri);
    }

    // Returned to the page. If mediaLoaded, and currentMediaInfo is different, update
    if (this.state.mediaLoaded && window.currentMediaInfo && window.currentMediaInfo.uri !== this.state.uri) {
      const { metadata } = this.props;
      window.currentMediaInfo = {
        channel: claim ? claim.channel_name : null,
        title: metadata ? metadata.title : claim.name,
        uri: this.state.uri,
      };
    }
  }

  fetchFileInfo(props) {
    if (props.fileInfo === undefined) {
      props.fetchFileInfo(props.navigation.state.params.uri);
    }
  }

  fetchCostInfo(props) {
    if (props.costInfo === undefined) {
      props.fetchCostInfo(props.navigation.state.params.uri);
    }
  }

  handleFullscreenToggle = mode => {
    this.setState({ fullscreenMode: mode });
    StatusBar.setHidden(mode);
    if (NativeModules.ScreenOrientation) {
      if (mode) {
        // fullscreen, so change orientation to landscape mode
        NativeModules.ScreenOrientation.lockOrientationLandscape();
        if (NativeModules.UtilityModule) {
          // hide the navigation bar (on devices that use have soft navigation bar)
          NativeModules.UtilityModule.hideNavigationBar();
        }
      } else {
        // Switch back to portrait mode when the media is not fullscreen
        NativeModules.ScreenOrientation.lockOrientationPortrait();
        if (NativeModules.UtilityModule) {
          // hide the navigation bar (on devices that use have soft navigation bar)
          NativeModules.UtilityModule.showNavigationBar();
        }
      }
    }
  };

  onDeletePressed = () => {
    const { claim, deleteFile, deletePurchasedUri, fileInfo, navigation } = this.props;

    Alert.alert(
      'Delete file',
      'Are you sure you want to remove this file from your device?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: () => {
            const { uri } = navigation.state.params;
            deleteFile(`${claim.txid}:${claim.nout}`, true);
            deletePurchasedUri(uri);
            if (NativeModules.UtilityModule) {
              NativeModules.UtilityModule.deleteDownload(uri);
            }
            this.setState({
              downloadPressed: false,
              fileViewLogged: false,
              mediaLoaded: false,
              stopDownloadConfirmed: false,
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  onStopDownloadPressed = () => {
    const { deletePurchasedUri, fileInfo, navigation, notify, stopDownload } = this.props;

    Alert.alert(
      'Stop download',
      'Are you sure you want to stop downloading this file?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: () => {
            const { uri } = navigation.state.params;
            stopDownload(uri, fileInfo);
            deletePurchasedUri(uri);
            if (NativeModules.UtilityModule) {
              NativeModules.UtilityModule.deleteDownload(uri);
            }
            this.setState({
              downloadPressed: false,
              fileViewLogged: false,
              mediaLoaded: false,
              stopDownloadConfirmed: true,
            });

            // there can be a bit of lag between the user pressing Yes and the UI being updated
            // after the file_set_status and file_delete operations, so let the user know
            notify({
              message: 'The download will stop momentarily. You do not need to wait to discover something else.',
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  componentWillUnmount() {
    StatusBar.setHidden(false);
    if (NativeModules.ScreenOrientation) {
      NativeModules.ScreenOrientation.unlockOrientation();
    }
    if (NativeModules.UtilityModule) {
      const utility = NativeModules.UtilityModule;
      utility.keepAwakeOff();
      utility.showNavigationBar();
    }
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
    if (window.currentMediaInfo) {
      window.currentMediaInfo = null;
    }
    window.player = null;

    DeviceEventEmitter.removeListener('onDownloadStarted', this.handleDownloadStarted);
    DeviceEventEmitter.removeListener('onDownloadUpdated', this.handleDownloadUpdated);
    DeviceEventEmitter.removeListener('onDownloadCompleted', this.handleDownloadCompleted);
  }

  handleDownloadStarted = evt => {
    const { startDownload } = this.props;
    const { uri, outpoint, fileInfo } = evt;
    startDownload(uri, outpoint, fileInfo);
  };

  handleDownloadUpdated = evt => {
    const { updateDownload } = this.props;
    const { uri, outpoint, fileInfo, progress } = evt;
    updateDownload(uri, outpoint, fileInfo, progress);
  };

  handleDownloadCompleted = evt => {
    const { completeDownload } = this.props;
    const { uri, outpoint, fileInfo } = evt;
    completeDownload(uri, outpoint, fileInfo);
  };

  localUriForFileInfo = fileInfo => {
    if (!fileInfo) {
      return null;
    }
    return 'file:///' + fileInfo.download_path;
  };

  playerUriForFileInfo = fileInfo => {
    const { streamingUrl } = this.props;
    if (fileInfo && fileInfo.download_path) {
      return this.getEncodedDownloadPath(fileInfo);
    }
    if (streamingUrl) {
      return streamingUrl;
    }
    if (this.state.currentStreamUrl) {
      return this.state.currentStreamUrl;
    }

    return null;
  };

  getEncodedDownloadPath = fileInfo => {
    if (this.state.encodedFilePath) {
      return this.state.encodedFilePath;
    }

    const { file_name: fileName } = fileInfo;
    const encodedFileName = encodeURIComponent(fileName).replace(/!/g, '%21');
    const encodedFilePath = fileInfo.download_path.replace(fileName, encodedFileName);
    return encodedFilePath;
  };

  linkify = text => {
    let linkifiedContent = [];
    let lines = text.split(/\n/g);
    linkifiedContent = lines.map((line, i) => {
      let tokens = line.split(/\s/g);
      let lineContent =
        tokens.length === 0
          ? ''
          : tokens.map((token, j) => {
            let hasSpace = j !== tokens.length - 1;
            let space = hasSpace ? ' ' : '';

            if (token.match(/^(lbry|https?):\/\//g)) {
              return (
                <Link
                  key={j}
                  style={filePageStyle.link}
                  href={token}
                  text={token}
                  effectOnTap={filePageStyle.linkTapped}
                />
              );
            } else {
              return token + space;
            }
          });

      lineContent.push('\n');
      return <Text key={i}>{lineContent}</Text>;
    });

    return linkifiedContent;
  };

  checkOrientation = () => {
    if (this.state.fullscreenMode) {
      return;
    }

    const screenDimension = Dimensions.get('window');
    const screenWidth = screenDimension.width;
    const screenHeight = screenDimension.height;
    const isLandscape = screenWidth > screenHeight;
    this.setState({ isLandscape });

    if (!this.playerBackground) {
      return;
    }

    if (isLandscape) {
      this.playerBackground.setNativeProps({
        height: screenHeight - StyleSheet.flatten(uriBarStyle.uriContainer).height,
      });
    } else if (this.state.playerBgHeight > 0) {
      this.playerBackground.setNativeProps({ height: this.state.playerBgHeight });
    }
  };

  onMediaLoaded = (channelName, title, uri) => {
    this.setState({ mediaLoaded: true });
    window.currentMediaInfo = { channel: channelName, title, uri };
  };

  onPlaybackStarted = () => {
    let timeToStartMillis, timeToStart;
    if (this.startTime) {
      timeToStartMillis = Date.now() - this.startTime;
      timeToStart = Math.ceil(timeToStartMillis / 1000);
      this.startTime = null;
    }

    const { claim, navigation } = this.props;
    const { uri } = navigation.state.params;
    this.logFileView(uri, claim, timeToStartMillis);

    let payload = { uri: uri };
    if (!isNaN(timeToStart)) {
      payload['time_to_start_seconds'] = timeToStart;
      payload['time_to_start_ms'] = timeToStartMillis;
    }
    NativeModules.Firebase.track('play', payload);
  };

  onPlaybackFinished = () => {
    if (this.scrollView && this.state.relatedContentY) {
      this.scrollView.scrollTo({ x: 0, y: this.state.relatedContentY, animated: true });
    }
  };

  setRelatedContentPosition = evt => {
    if (!this.state.relatedContentY) {
      this.setState({ relatedContentY: evt.nativeEvent.layout.y });
    }
  };

  logFileView = (uri, claim, timeToStart) => {
    if (!claim) {
      return;
    }

    const { nout, claim_id: claimId, txid } = claim;
    const outpoint = `${txid}:${nout}`;
    const params = {
      uri,
      outpoint,
      claim_id: claimId,
    };
    if (!isNaN(timeToStart)) {
      params.time_to_start = timeToStart;
    }

    Lbryio.call('file', 'view', params).catch(() => {});
    this.setState({ fileViewLogged: true });
  };

  handleSendTip = () => {
    const { claim, balance, navigation, notify, sendTip } = this.props;
    const { uri } = navigation.state.params;
    const { tipAmount } = this.state;

    if (tipAmount > balance) {
      notify({
        message: 'Insufficient credits',
      });
      return;
    }

    sendTip(tipAmount, claim.claim_id, uri, () => {
      this.setState({ tipAmount: 0, showTipView: false });
    });
  };

  renderTags = tags => {
    const { navigation } = this.props;
    return tags.map((tag, i) => (
      <Tag style={filePageStyle.tagItem} key={`${tag}-${i}`} name={tag} navigation={navigation} />
    ));
  };

  onFileDownloadButtonPlayed = () => {
    const { setPlayerVisible } = this.props;
    this.startTime = Date.now();
    this.setState({ downloadPressed: true, autoPlayMedia: true, stopDownloadConfirmed: false });
    setPlayerVisible();
  };

  onBackButtonPressed = () => {
    const { navigation, drawerStack, popDrawerStack } = this.props;
    navigateBack(navigation, drawerStack, popDrawerStack);
  };

  onSaveFilePressed = () => {
    const { costInfo, fileGet, fileInfo, navigation, purchasedUris, purchaseUri } = this.props;
    const { uri } = navigation.state.params;

    if (fileInfo || purchasedUris.includes(uri)) {
      // file already in library or URI already purchased, use fileGet directly
      this.setState({ fileGetStarted: true }, () => fileGet(uri, true));
    } else {
      this.setState(
        {
          downloadPressed: true,
          autoPlayMedia: false,
          stopDownloadConfirmed: false,
        },
        () => purchaseUri(uri, costInfo, true)
      );
    }
  };

  render() {
    const {
      balance,
      claim,
      channelUri,
      costInfo,
      fileInfo,
      metadata,
      contentType,
      tab,
      rewardedContentClaimIds,
      isResolvingUri,
      blackListedOutpoints,
      navigation,
      position,
      purchaseUri,
      thumbnail,
      title,
    } = this.props;
    const { uri, autoplay } = navigation.state.params;

    let innerContent = null;
    if ((isResolvingUri && !claim) || !claim) {
      return (
        <View style={filePageStyle.container}>
          {isResolvingUri && (
            <View style={filePageStyle.busyContainer}>
              <ActivityIndicator size="large" color={Colors.NextLbryGreen} />
              <Text style={filePageStyle.infoText}>Loading decentralized data...</Text>
            </View>
          )}
          {claim === null && !isResolvingUri && (
            <View style={filePageStyle.container}>
              <Text style={filePageStyle.emptyClaimText}>There's nothing at this location.</Text>
            </View>
          )}
          <UriBar value={uri} navigation={navigation} />
        </View>
      );
    }

    if (claim) {
      if (claim && claim.name.length && claim.name[0] === '@') {
        return <ChannelPage uri={uri} navigation={navigation} />;
      }

      let isClaimBlackListed = false;

      if (blackListedOutpoints) {
        for (let i = 0; i < blackListedOutpoints.length; i += 1) {
          const outpoint = blackListedOutpoints[i];
          if (outpoint.txid === claim.txid && outpoint.nout === claim.nout) {
            isClaimBlackListed = true;
            break;
          }
        }
      }

      if (isClaimBlackListed) {
        return (
          <View style={filePageStyle.pageContainer}>
            <View style={filePageStyle.dmcaContainer}>
              <Text style={filePageStyle.dmcaText}>
                In response to a complaint we received under the US Digital Millennium Copyright Act, we have blocked
                access to this content from our applications.
              </Text>
              <Link style={filePageStyle.dmcaLink} href="https://lbry.com/faq/dmca" text="Read More" />
            </View>
            <UriBar value={uri} navigation={navigation} />
          </View>
        );
      }

      let tags = [];
      if (claim && claim.value && claim.value.tags) {
        tags = claim.value.tags;
      }

      const completed = fileInfo && fileInfo.completed;
      const isRewardContent = rewardedContentClaimIds.includes(claim.claim_id);
      const description = metadata.description ? metadata.description : null;
      const mediaType = Lbry.getMediaType(contentType);
      const isPlayable = mediaType === 'video' || mediaType === 'audio';
      const { height, signing_channel: signingChannel, value } = claim;
      const channelName = signingChannel && signingChannel.name;
      const showActions =
        fileInfo &&
        fileInfo.download_path &&
        !this.state.fullscreenMode &&
        !this.state.showImageViewer &&
        !this.state.showWebView;
      const showFileActions =
        fileInfo &&
        fileInfo.download_path &&
        (completed || (fileInfo && !fileInfo.stopped && fileInfo.written_bytes < fileInfo.total_bytes));
      const channelClaimId = claim && claim.signing_channel && claim.signing_channel.claim_id;
      const canSendTip = this.state.tipAmount > 0;
      const fullUri = `${claim.name}#${claim.claim_id}`;
      const fullChannelUri =
        channelClaimId && channelClaimId.trim().length > 0
          ? normalizeURI(`${channelName}#${channelClaimId}`)
          : normalizeURI(channelName);
      const shortChannelUri = signingChannel ? signingChannel.short_url : null;

      const playerStyle = [
        filePageStyle.player,
        this.state.isLandscape
          ? filePageStyle.containedPlayerLandscape
          : this.state.fullscreenMode
            ? filePageStyle.fullscreenPlayer
            : filePageStyle.containedPlayer,
      ];
      const playerBgStyle = [filePageStyle.playerBackground, filePageStyle.containedPlayerBackground];
      const fsPlayerBgStyle = [filePageStyle.playerBackground, filePageStyle.fullscreenPlayerBackground];
      // at least 2MB (or the full download) before media can be loaded
      const canLoadMedia =
        this.state.streamingMode ||
        (fileInfo && (fileInfo.written_bytes >= 2097152 || fileInfo.written_bytes === fileInfo.total_bytes)); // 2MB = 1024*1024*2
      const isViewable = mediaType === 'image' || mediaType === 'text';
      const isWebViewable = mediaType === 'text';
      const canOpen = isViewable && completed;
      const localFileUri = this.localUriForFileInfo(fileInfo);

      const openFile = () => {
        if (mediaType === 'image') {
          // use image viewer
          if (!this.state.showImageViewer) {
            this.setState({
              imageUrls: [
                {
                  url: localFileUri,
                },
              ],
              showImageViewer: true,
            });
          }
        }
        if (isWebViewable) {
          // show webview
          if (!this.state.showWebView) {
            this.setState({
              showWebView: true,
            });
          }
        }
      };

      if (fileInfo && !this.state.autoDownloadStarted && this.state.uriVars && this.state.uriVars.download === 'true') {
        this.setState({ autoDownloadStarted: true }, () => {
          purchaseUri(uri, costInfo, !isPlayable);
          if (NativeModules.UtilityModule) {
            NativeModules.UtilityModule.checkDownloads();
          }
        });
      }

      if (this.state.downloadPressed && canOpen) {
        // automatically open a web viewable or image file after the download button is pressed
        openFile();
      }

      return (
        <View style={filePageStyle.pageContainer}>
          {!this.state.fullscreenMode && <UriBar value={uri} navigation={navigation} />}
          {this.state.showWebView && isWebViewable && (
            <WebView source={{ uri: localFileUri }} style={filePageStyle.viewer} />
          )}

          {this.state.showImageViewer && (
            <ImageViewer
              style={StyleSheet.flatten(filePageStyle.viewer)}
              imageUrls={this.state.imageUrls}
              renderIndicator={() => null}
            />
          )}

          {!this.state.showWebView && (
            <View
              style={
                this.state.fullscreenMode ? filePageStyle.innerPageContainerFsMode : filePageStyle.innerPageContainer
              }
              onLayout={this.checkOrientation}
            >
              <View style={filePageStyle.mediaContainer}>
                {(canOpen || (!fileInfo || (isPlayable && !canLoadMedia)) || (!canOpen && fileInfo)) && (
                  <FileItemMedia style={filePageStyle.thumbnail} title={title} thumbnail={thumbnail} />
                )}
                {(!this.state.downloadButtonShown || this.state.downloadPressed) && !this.state.mediaLoaded && (
                  <ActivityIndicator size="large" color={Colors.NextLbryGreen} style={filePageStyle.loading} />
                )}
                {((isPlayable && !completed && !canLoadMedia) ||
                  canOpen ||
                  (!completed && !this.state.streamingMode)) &&
                  !this.state.downloadPressed && (
                  <FileDownloadButton
                    uri={uri}
                    style={filePageStyle.downloadButton}
                    openFile={openFile}
                    isPlayable={isPlayable}
                    isViewable={isViewable}
                    onPlay={this.onFileDownloadButtonPlayed}
                    onView={() => this.setState({ downloadPressed: true })}
                    onButtonLayout={() => this.setState({ downloadButtonShown: true })}
                  />
                )}
                {!fileInfo && (
                  <FilePrice
                    uri={uri}
                    style={filePageStyle.filePriceContainer}
                    textStyle={filePageStyle.filePriceText}
                  />
                )}

                <TouchableOpacity style={filePageStyle.backButton} onPress={this.onBackButtonPressed}>
                  <Icon name={'arrow-left'} size={18} style={filePageStyle.backButtonIcon} />
                </TouchableOpacity>
              </View>
              {(this.state.streamingMode || (canLoadMedia && fileInfo && isPlayable)) && (
                <View
                  style={playerBgStyle}
                  ref={ref => {
                    this.playerBackground = ref;
                  }}
                  onLayout={evt => {
                    if (!this.state.playerBgHeight) {
                      this.setState({ playerBgHeight: evt.nativeEvent.layout.height });
                    }
                  }}
                />
              )}
              {(this.state.streamingMode || (canLoadMedia && fileInfo && isPlayable)) && this.state.fullscreenMode && (
                <View style={fsPlayerBgStyle} />
              )}
              {(this.state.streamingMode || (canLoadMedia && fileInfo && isPlayable)) && (
                <MediaPlayer
                  claim={claim}
                  assignPlayer={ref => {
                    this.player = ref;
                  }}
                  uri={uri}
                  source={this.playerUriForFileInfo(fileInfo)}
                  style={playerStyle}
                  autoPlay={autoplay || this.state.autoPlayMedia}
                  onFullscreenToggled={this.handleFullscreenToggle}
                  onLayout={evt => {
                    if (!this.state.playerHeight) {
                      this.setState({ playerHeight: evt.nativeEvent.layout.height });
                    }
                  }}
                  onMediaLoaded={() => this.onMediaLoaded(channelName, title, uri)}
                  onBackButtonPressed={this.onBackButtonPressed}
                  onPlaybackStarted={this.onPlaybackStarted}
                  onPlaybackFinished={this.onPlaybackFinished}
                  thumbnail={thumbnail}
                  position={position}
                />
              )}

              {showActions && showFileActions && (
                <View style={filePageStyle.actions}>
                  {showFileActions && (
                    <View style={filePageStyle.fileActions}>
                      {completed && (
                        <Button
                          style={filePageStyle.actionButton}
                          theme={'light'}
                          icon={'trash'}
                          text={'Delete'}
                          onPress={this.onDeletePressed}
                        />
                      )}
                      {!completed &&
                        fileInfo &&
                        !fileInfo.stopped &&
                        fileInfo.written_bytes < fileInfo.total_bytes &&
                        !this.state.stopDownloadConfirmed && (
                        <Button
                          style={filePageStyle.actionButton}
                          icon={'stop'}
                          theme={'light'}
                          text={'Stop Download'}
                          onPress={this.onStopDownloadPressed}
                        />
                      )}
                    </View>
                  )}
                </View>
              )}
              <ScrollView
                style={showActions ? filePageStyle.scrollContainerActions : filePageStyle.scrollContainer}
                contentContainerstyle={showActions ? null : filePageStyle.scrollContent}
                keyboardShouldPersistTaps={'handled'}
                ref={ref => {
                  this.scrollView = ref;
                }}
              >
                <TouchableWithoutFeedback
                  style={filePageStyle.titleTouch}
                  onPress={() => this.setState({ showDescription: !this.state.showDescription })}
                >
                  <View style={filePageStyle.titleRow}>
                    <Text style={filePageStyle.title} selectable>
                      {title}
                    </Text>
                    <View style={filePageStyle.descriptionToggle}>
                      <Icon name={this.state.showDescription ? 'caret-up' : 'caret-down'} size={24} />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                <View style={filePageStyle.channelRow}>
                  <View style={filePageStyle.publishInfo}>
                    {channelName && (
                      <Link
                        style={filePageStyle.channelName}
                        selectable
                        text={channelName}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        onPress={() => {
                          navigateToUri(navigation, normalizeURI(shortChannelUri || fullChannelUri));
                        }}
                      />
                    )}
                    {!channelName && (
                      <Text style={filePageStyle.anonChannelName} selectable ellipsizeMode={'tail'}>
                        Anonymous
                      </Text>
                    )}
                    <DateTime
                      style={filePageStyle.publishDate}
                      textStyle={filePageStyle.publishDateText}
                      uri={uri}
                      formatOptions={{ day: 'numeric', month: 'long', year: 'numeric' }}
                      show={DateTime.SHOW_DATE}
                    />
                  </View>
                  <View style={filePageStyle.subscriptionRow}>
                    {false && ((isPlayable && !fileInfo) || (isPlayable && fileInfo && !fileInfo.download_path)) && (
                      <Button
                        style={[filePageStyle.actionButton, filePageStyle.saveFileButton]}
                        theme={'light'}
                        icon={'download'}
                        onPress={this.onSaveFilePressed}
                      />
                    )}
                    <Button
                      style={[filePageStyle.actionButton, filePageStyle.tipButton]}
                      theme={'light'}
                      icon={'gift'}
                      onPress={() => this.setState({ showTipView: true })}
                    />
                    {channelName && (
                      <SubscribeButton
                        style={filePageStyle.actionButton}
                        uri={fullChannelUri}
                        name={channelName}
                        hideText={false}
                      />
                    )}
                    {channelName && (
                      <SubscribeNotificationButton
                        style={[filePageStyle.actionButton, filePageStyle.bellButton]}
                        uri={fullChannelUri}
                        name={channelName}
                      />
                    )}
                  </View>
                </View>

                {this.state.showTipView && <View style={filePageStyle.divider} />}
                {this.state.showTipView && (
                  <View style={filePageStyle.tipCard}>
                    <View style={filePageStyle.row}>
                      <View style={filePageStyle.amountRow}>
                        <TextInput
                          ref={ref => (this.tipAmountInput = ref)}
                          onChangeText={value => this.setState({ tipAmount: value })}
                          underlineColorAndroid={Colors.NextLbryGreen}
                          keyboardType={'numeric'}
                          placeholder={'0'}
                          value={this.state.tipAmount}
                          style={[filePageStyle.input, filePageStyle.tipAmountInput]}
                        />
                        <Text style={[filePageStyle.text, filePageStyle.currency]}>LBC</Text>
                      </View>
                      <Link
                        style={[filePageStyle.link, filePageStyle.cancelTipLink]}
                        text={'Cancel'}
                        onPress={() => this.setState({ showTipView: false })}
                      />
                      <Button
                        text={'Send a tip'}
                        style={[filePageStyle.button, filePageStyle.sendButton]}
                        disabled={!canSendTip}
                        onPress={this.handleSendTip}
                      />
                    </View>
                  </View>
                )}

                {this.state.showDescription && description && description.length > 0 && (
                  <View style={filePageStyle.divider} />
                )}
                {this.state.showDescription && description && (
                  <View>
                    <Text style={filePageStyle.description} selectable>
                      {this.linkify(description)}
                    </Text>
                    {tags && tags.length > 0 && (
                      <View style={filePageStyle.tagContainer}>
                        <Text style={filePageStyle.tagTitle}>Tags</Text>
                        <View style={filePageStyle.tagList}>{this.renderTags(tags)}</View>
                      </View>
                    )}
                  </View>
                )}

                {costInfo && parseFloat(costInfo.cost) > balance && !fileInfo && (
                  <FileRewardsDriver navigation={navigation} />
                )}

                <View onLayout={this.setRelatedContentPosition} />
                <RelatedContent navigation={navigation} uri={uri} fullUri={fullUri} />
              </ScrollView>
            </View>
          )}
          {!this.state.fullscreenMode && !this.state.showImageViewer && !this.state.showWebView && (
            <FloatingWalletBalance navigation={navigation} />
          )}
        </View>
      );
    }

    return null;
  }
}

export default FilePage;
