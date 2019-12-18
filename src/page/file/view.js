import React from 'react';
import { Lbry, normalizeURI, parseURI } from 'lbry-redux';
import { Lbryio } from 'lbryinc';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Dimensions,
  Image,
  Linking,
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
import { navigateBack, navigateToUri, formatLbryUrlForWeb } from 'utils/helper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ImageViewer from 'react-native-image-zoom-viewer';
import Button from 'component/button';
import EmptyStateView from 'component/emptyStateView';
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
import ModalTipView from 'component/modalTipView';
import RelatedContent from 'component/relatedContent';
import SubscribeButton from 'component/subscribeButton';
import SubscribeNotificationButton from 'component/subscribeNotificationButton';
import UriBar from 'component/uriBar';
import Video from 'react-native-video';
import FileRewardsDriver from 'component/fileRewardsDriver';
import filePageStyle from 'styles/filePage';
import uriBarStyle from 'styles/uriBar';
import _ from 'lodash';

class FilePage extends React.PureComponent {
  static navigationOptions = {
    title: '',
  };

  playerBackground = null;

  scrollView = null;

  startTime = null;

  constructor(props) {
    super(props);
    this.state = {
      attemptAutoGet: false,
      autoOpened: false,
      autoDownloadStarted: false,
      autoPlayMedia: false,
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
      sendTipStarted: false,
      showDescription: false,
      showImageViewer: false,
      showWebView: false,
      showTipView: false,
      playerBgHeight: 0,
      playerHeight: 0,
      uri: null,
      uriVars: null,
      stopDownloadConfirmed: false,
      streamingMode: false,
      didSearchRecommended: false,
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

    const { fetchMyClaims, fileInfo, isResolvingUri, resolveUri, navigation } = this.props;
    const { uri, uriVars } = navigation.state.params;
    this.setState({ uri, uriVars });

    if (!isResolvingUri) resolveUri(uri);

    this.fetchFileInfo(this.props);
    this.fetchCostInfo(this.props);
    fetchMyClaims();

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

  difference = (object, base) => {
    function changes(object, base) {
      return _.transform(object, function(result, value, key) {
        if (!_.isEqual(value, base[key])) {
          result[key] = _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
        }
      });
    }
    return changes(object, base);
  };

  componentWillReceiveProps(nextProps) {
    const {
      claim,
      currentRoute,
      failedPurchaseUris: prevFailedPurchaseUris,
      purchasedUris: prevPurchasedUris,
      navigation,
      contentType,
      notify,
      drawerStack: prevDrawerStack,
    } = this.props;
    const { uri } = navigation.state.params;
    const {
      currentRoute: prevRoute,
      failedPurchaseUris,
      fileInfo,
      purchasedUris,
      purchaseUriErrorMessage,
      streamingUrl,
      drawerStack,
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

    if (
      prevDrawerStack[prevDrawerStack.length - 1].route === Constants.DRAWER_ROUTE_FILE_VIEW &&
      prevDrawerStack.length !== drawerStack.length
    ) {
      this.setState({
        downloadPressed: false,
        showImageViewer: false,
        showWebView: false,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      claim,
      contentType,
      costInfo,
      fileInfo,
      isResolvingUri,
      resolveUri,
      navigation,
      purchaseUri,
      searchRecommended,
      title,
    } = this.props;
    const { uri } = this.state;
    if (!isResolvingUri && claim === undefined && uri) {
      resolveUri(uri);
    }

    if (title && !this.state.didSearchRecommended) {
      this.setState({ didSearchRecommended: true }, () => searchRecommended(title));
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

    // attempt to retrieve images and html/text automatically once the claim is loaded, and it's free
    const mediaType = Lbry.getMediaType(contentType);
    const isViewable = mediaType === 'image' || mediaType === 'text';
    if (claim && costInfo && costInfo.cost === 0 && !this.state.autoGetAttempted && isViewable) {
      this.setState(
        {
          autoGetAttempted: true,
          downloadPressed: true,
          autoPlayMedia: true,
          stopDownloadConfirmed: false,
        },
        () => purchaseUri(claim.permanent_url, costInfo, true)
      );
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

  handleFullscreenToggle = isFullscreen => {
    const { toggleFullscreenMode } = this.props;
    this.setState({ fullscreenMode: isFullscreen });
    toggleFullscreenMode(isFullscreen);

    StatusBar.setHidden(isFullscreen);

    if (isFullscreen) {
      // fullscreen, so change orientation to landscape mode
      NativeModules.ScreenOrientation.lockOrientationLandscape();

      // hide the navigation bar (on devices that have the soft navigation bar)
      NativeModules.UtilityModule.hideNavigationBar();
    } else {
      // Switch back to portrait mode when the media is not fullscreen
      NativeModules.ScreenOrientation.lockOrientationPortrait();

      // hide the navigation bar (on devices that have the soft navigation bar)
      NativeModules.UtilityModule.showNavigationBar();
    }
  };

  onEditPressed = () => {
    const { claim, navigation } = this.props;
    navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH, params: { editMode: true, claimToEdit: claim } });
  };

  onDeletePressed = () => {
    const { abandonClaim, claim, deleteFile, deletePurchasedUri, myClaimUris, fileInfo, navigation } = this.props;

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

            NativeModules.UtilityModule.deleteDownload(uri);
            this.setState({
              downloadPressed: false,
              fileViewLogged: false,
              mediaLoaded: false,
              stopDownloadConfirmed: false,
            });

            if (claim) {
              const fullUri = normalizeURI(`${claim.name}#${claim.claim_id}`);
              const ownedClaim = myClaimUris.includes(fullUri);
              if (ownedClaim) {
                const { txid, nout } = claim;
                abandonClaim(txid, nout);
                navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISHES });
              }
            }
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

    const { claimEligibleRewards } = this.props;
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

    Lbryio.call('file', 'view', params)
      .then(() => claimEligibleRewards())
      .catch(() => {});
    this.setState({ fileViewLogged: true });
  };

  handleSharePress = () => {
    const { claim, notify } = this.props;
    if (claim) {
      const { canonical_url: canonicalUrl, short_url: shortUrl, permanent_url: permanentUrl } = claim;
      const url = Constants.SHARE_BASE_URL + formatLbryUrlForWeb(canonicalUrl || shortUrl || permanentUrl);
      NativeModules.UtilityModule.shareUrl(url);
    }
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

  onDownloadPressed = () => {
    const { claim, costInfo, purchaseUri } = this.props;
    this.setState(
      {
        downloadPressed: true,
        autoPlayMedia: false,
        stopDownloadConfirmed: false,
      },
      () => purchaseUri(claim.permanent_url, costInfo, true)
    );
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

  openFile = (localFileUri, mediaType) => {
    const { pushDrawerStack } = this.props;
    const isWebViewable = mediaType === 'text';

    if (mediaType === 'image') {
      // use image viewer
      if (!this.state.showImageViewer) {
        this.setState(
          {
            imageUrls: [
              {
                url: localFileUri,
              },
            ],
            showImageViewer: true,
          },
          () => pushDrawerStack(Constants.DRAWER_ROUTE_FILE_VIEW)
        );
      }
    }
    if (isWebViewable) {
      // show webview
      if (!this.state.showWebView) {
        this.setState(
          {
            showWebView: true,
          },
          () => pushDrawerStack(Constants.DRAWER_ROUTE_FILE_VIEW)
        );
      }
    }
  };

  onMediaContainerPressed = () => {
    const { costInfo, contentType, purchaseUri } = this.props;
    const { uri } = this.state;
    const mediaType = Lbry.getMediaType(contentType);
    const isPlayable = mediaType === 'video' || mediaType === 'audio';
    purchaseUri(uri, costInfo, isPlayable);
    if (isPlayable) {
      this.onFileDownloadButtonPlayed();
    }
  };

  render() {
    const {
      balance,
      claim,
      channels,
      channelUri,
      costInfo,
      fileInfo,
      metadata,
      contentType,
      tab,
      rewardedContentClaimIds,
      isResolvingUri,
      blackListedOutpoints,
      myClaimUris,
      navigation,
      position,
      purchaseUri,
      pushDrawerStack,
      isSearchingRecommendContent,
      recommendedContent,
      thumbnail,
      title,
    } = this.props;
    const { uri, autoplay } = navigation.state.params;

    const { isChannel } = parseURI(uri);
    const myChannelUris = channels ? channels.map(channel => channel.permanent_url) : [];
    const ownedClaim = myClaimUris.includes(uri) || myChannelUris.includes(uri);

    let innerContent = null;
    if ((isResolvingUri && !claim) || !claim) {
      return (
        <View style={filePageStyle.container}>
          <UriBar value={uri} navigation={navigation} />
          {isResolvingUri && (
            <View style={filePageStyle.busyContainer}>
              <ActivityIndicator size="large" color={Colors.NextLbryGreen} />
              <Text style={filePageStyle.infoText}>{__('Loading decentralized data...')}</Text>
            </View>
          )}
          {claim === null && !isResolvingUri && (
            <View style={filePageStyle.container}>
              {ownedClaim && (
                <EmptyStateView
                  message={
                    isChannel
                      ? __('It looks like you just created this channel. It will appear in a few minutes.')
                      : __('It looks you just published this content. It will appear in a few minutes.')
                  }
                />
              )}
              {!ownedClaim && (
                <EmptyStateView
                  message={__("There's nothing at this location.")}
                  buttonText={__('Publish something here')}
                  onButtonPress={() =>
                    navigation.navigate({
                      routeName: Constants.DRAWER_ROUTE_PUBLISH,
                      params: { vanityUrl: uri.trim() },
                    })
                  }
                />
              )}
            </View>
          )}
          <FloatingWalletBalance navigation={navigation} />
        </View>
      );
    }

    if (claim) {
      if (isChannel) {
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
                {__(
                  'In response to a complaint we received under the US Digital Millennium Copyright Act, we have blocked access to this content from our applications.'
                )}
              </Text>
              <Link style={filePageStyle.dmcaLink} href="https://lbry.com/faq/dmca" text={__('Read More')} />
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
      const isWebViewable = mediaType === 'text';
      const { height, signing_channel: signingChannel, value } = claim;
      const channelName = signingChannel && signingChannel.name;
      const channelClaimId = claim && claim.signing_channel && claim.signing_channel.claim_id;
      const fullUri = `${claim.name}#${claim.claim_id}`;
      const canEdit = myClaimUris.includes(normalizeURI(fullUri));
      const showActions =
        (canEdit || (fileInfo && fileInfo.download_path)) &&
        !this.state.fullscreenMode &&
        !this.state.showImageViewer &&
        !this.state.showWebView;
      const showFileActions =
        canEdit ||
        (fileInfo &&
          fileInfo.download_path &&
          (completed || (fileInfo && !fileInfo.stopped && fileInfo.written_bytes < fileInfo.total_bytes)));
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
      const duration = claim && claim.value && claim.value.video ? claim.value.video.duration : null;
      const isViewable = mediaType === 'image' || mediaType === 'text';
      const canOpen = isViewable && completed;
      const localFileUri = this.localUriForFileInfo(fileInfo);
      const unsupported = !isPlayable && !canOpen;

      if (fileInfo && !this.state.autoDownloadStarted && this.state.uriVars && this.state.uriVars.download === 'true') {
        this.setState({ autoDownloadStarted: true }, () => {
          purchaseUri(uri, costInfo, !isPlayable);
          if (NativeModules.UtilityModule) {
            NativeModules.UtilityModule.checkDownloads();
          }
        });
      }

      if (this.state.downloadPressed && canOpen && !this.state.autoOpened) {
        // automatically open a web viewable or image file after the download button is pressed
        this.setState({ autoOpened: true }, () => this.openFile(localFileUri, mediaType));
      }

      return (
        <View style={filePageStyle.pageContainer}>
          {!this.state.fullscreenMode && <UriBar value={uri} navigation={navigation} />}
          {this.state.showWebView && isWebViewable && (
            <WebView allowFileAccess source={{ uri: localFileUri }} style={filePageStyle.viewer} />
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
              <TouchableOpacity
                activeOpacity={0.5}
                style={filePageStyle.mediaContainer}
                onPress={this.onMediaContainerPressed}
              >
                {(canOpen || (!fileInfo || (isPlayable && !canLoadMedia)) || (!canOpen && fileInfo)) && (
                  <FileItemMedia
                    duration={duration}
                    style={filePageStyle.thumbnail}
                    title={title}
                    thumbnail={thumbnail}
                  />
                )}
                {!unsupported &&
                  (!this.state.downloadButtonShown || this.state.downloadPressed) &&
                  !this.state.mediaLoaded && (
                  <ActivityIndicator size="large" color={Colors.NextLbryGreen} style={filePageStyle.loading} />
                )}

                {unsupported && fileInfo && completed && (
                  <View style={filePageStyle.unsupportedContent}>
                    <Image
                      style={filePageStyle.unsupportedContentImage}
                      resizeMode={'stretch'}
                      source={require('../../assets/gerbil-happy.png')}
                    />
                    <View style={filePageStyle.unspportedContentTextContainer}>
                      <Text style={filePageStyle.unsupportedContentTitle}>{__('Unsupported Content')}</Text>
                      <Text style={filePageStyle.unsupportedContentText}>
                        Sorry, we are unable to display this content in the app. You can find the file named{' '}
                        <Text style={filePageStyle.unsupportedContentFilename}>{fileInfo.file_name}</Text> in your
                        downloads folder.
                      </Text>
                    </View>
                  </View>
                )}

                {((isPlayable && !completed && !canLoadMedia) ||
                  canOpen ||
                  (!completed && !this.state.streamingMode)) &&
                  !this.state.downloadPressed && (
                  <FileDownloadButton
                    uri={claim && claim.permanent_url ? claim.permanent_url : uri}
                    style={filePageStyle.downloadButton}
                    openFile={() => this.openFile(localFileUri, mediaType)}
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
              </TouchableOpacity>
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

              <ScrollView
                style={filePageStyle.scrollContainer}
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
                    {isRewardContent && <Icon name="award" style={filePageStyle.rewardIcon} size={16} />}
                    <View style={filePageStyle.descriptionToggle}>
                      <Icon name={this.state.showDescription ? 'caret-up' : 'caret-down'} size={24} />
                    </View>
                  </View>
                </TouchableWithoutFeedback>

                <View style={filePageStyle.largeButtonsRow}>
                  <TouchableOpacity style={filePageStyle.largeButton} onPress={this.handleSharePress}>
                    <Icon name={'share-alt'} size={16} style={filePageStyle.largeButtonIcon} />
                    <Text style={filePageStyle.largeButtonText}>{__('Share')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={filePageStyle.largeButton}
                    onPress={() => this.setState({ showTipView: true })}
                  >
                    <Icon name={'gift'} size={16} style={filePageStyle.largeButtonIcon} />
                    <Text style={filePageStyle.largeButtonText}>{__('Tip')}</Text>
                  </TouchableOpacity>

                  {!canEdit && !isPlayable && (
                    <View style={filePageStyle.sharedLargeButton}>
                      {!fileInfo ||
                        (fileInfo.written_bytes <= 0 && !completed && (
                          <TouchableOpacity style={filePageStyle.innerLargeButton} onPress={this.onDownloadPressed}>
                            <Icon name={'download'} size={16} style={filePageStyle.largeButtonIcon} />
                            <Text style={filePageStyle.largeButtonText}>{__('Download')}</Text>
                          </TouchableOpacity>
                        ))}

                      {!completed &&
                        fileInfo &&
                        !fileInfo.stopped &&
                        fileInfo.written_bytes > 0 &&
                        fileInfo.written_bytes < fileInfo.total_bytes &&
                        !this.state.stopDownloadConfirmed && (
                        <TouchableOpacity style={filePageStyle.innerLargeButton} onPress={this.onStopDownloadPressed}>
                          <Icon name={'stop'} size={16} style={filePageStyle.largeButtonIcon} />
                          <Text style={filePageStyle.largeButtonText}>{__('Stop')}</Text>
                        </TouchableOpacity>
                      )}

                      {completed && fileInfo && fileInfo.written_bytes >= fileInfo.total_bytes && (
                        <TouchableOpacity style={filePageStyle.innerLargeButton} onPress={this.onOpenFilePressed}>
                          <Icon name={'folder-open'} size={16} style={filePageStyle.largeButtonIcon} />
                          <Text style={filePageStyle.largeButtonText}>{__('Open')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {!canEdit && (
                    <TouchableOpacity
                      style={filePageStyle.largeButton}
                      onPress={() => Linking.openURL(`https://lbry.com/dmca/${claim.claim_id}`)}
                    >
                      <Icon name={'flag'} size={16} style={filePageStyle.largeButtonIcon} />
                      <Text style={filePageStyle.largeButtonText}>{__('Report')}</Text>
                    </TouchableOpacity>
                  )}

                  {canEdit && (
                    <TouchableOpacity style={filePageStyle.largeButton} onPress={this.onEditPressed}>
                      <Icon name={'edit'} size={16} style={filePageStyle.largeButtonIcon} />
                      <Text style={filePageStyle.largeButtonText}>{__('Edit')}</Text>
                    </TouchableOpacity>
                  )}

                  {(completed || canEdit) && (
                    <TouchableOpacity style={filePageStyle.largeButton} onPress={this.onDeletePressed}>
                      <Icon name={'trash-alt'} size={16} style={filePageStyle.largeButtonIcon} />
                      <Text style={filePageStyle.largeButtonText}>{__('Delete')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

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
                          navigateToUri(
                            navigation,
                            normalizeURI(shortChannelUri || fullChannelUri),
                            null,
                            false,
                            fullChannelUri
                          );
                        }}
                      />
                    )}
                    {!channelName && (
                      <Text style={filePageStyle.anonChannelName} selectable ellipsizeMode={'tail'}>
                        {__('Anonymous')}
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
                    {channelName && (
                      <SubscribeButton
                        style={filePageStyle.actionButton}
                        uri={fullChannelUri}
                        name={channelName}
                        hideText={false}
                      />
                    )}
                    {false && channelName && (
                      <SubscribeNotificationButton
                        style={[filePageStyle.actionButton, filePageStyle.bellButton]}
                        uri={fullChannelUri}
                        name={channelName}
                      />
                    )}
                  </View>
                </View>

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
                        <Text style={filePageStyle.tagTitle}>{__('Tags')}</Text>
                        <View style={filePageStyle.tagList}>{this.renderTags(tags)}</View>
                      </View>
                    )}
                  </View>
                )}

                {costInfo && parseFloat(costInfo.cost) > balance && !fileInfo && (
                  <FileRewardsDriver navigation={navigation} />
                )}

                <View onLayout={this.setRelatedContentPosition} />

                {isSearchingRecommendContent && (
                  <ActivityIndicator size="small" color={Colors.NextLbryGreen} style={filePageStyle.relatedLoading} />
                )}
                {!isSearchingRecommendContent && recommendedContent && recommendedContent.length > 0 && (
                  <RelatedContent navigation={navigation} uri={uri} fullUri={fullUri} />
                )}
              </ScrollView>
            </View>
          )}
          {this.state.showTipView && (
            <ModalTipView
              claim={claim}
              channelName={channelName}
              contentName={title}
              onCancelPress={() => this.setState({ showTipView: false })}
              onOverlayPress={() => this.setState({ showTipView: false })}
              onSendTipSuccessful={() => this.setState({ showTipView: false })}
            />
          )}
          {!this.state.fullscreenMode &&
            !this.state.showTipView &&
            !this.state.showImageViewer &&
            !this.state.showWebView && <FloatingWalletBalance navigation={navigation} />}
        </View>
      );
    }

    return null;
  }
}

export default FilePage;
