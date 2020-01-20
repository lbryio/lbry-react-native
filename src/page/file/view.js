import React from 'react';
import { Lbry, formatCredits, normalizeURI, parseURI } from 'lbry-redux';
import { Lbryio } from 'lbryinc';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  Dimensions,
  Image,
  Linking,
  NativeModules,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
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
import ProgressCircle from 'react-native-progress-circle';
import RelatedContent from 'component/relatedContent';
import SubscribeButton from 'component/subscribeButton';
import SubscribeNotificationButton from 'component/subscribeNotificationButton';
import UriBar from 'component/uriBar';
import Video from 'react-native-video';
import FileRewardsDriver from 'component/fileRewardsDriver';
import filePageStyle from 'styles/filePage';
import uriBarStyle from 'styles/uriBar';
import RNFS from 'react-native-fs';
import showdown from 'showdown';
import _ from 'lodash';

class FilePage extends React.PureComponent {
  static navigationOptions = {
    title: '',
  };

  playerBackground = null;

  scrollView = null;

  startTime = null;

  webView = null;

  converter = null;

  linkHandlerScript = `(function () {
    window.onclick = function(evt) { evt.preventDefault(); window.ReactNativeWebView.postMessage(evt.target.href); evt.stopPropagation(); }
  }());`;

  constructor(props) {
    super(props);
    this.state = {
      attemptAutoGet: false,
      autoOpened: false,
      autoDownloadStarted: false,
      autoPlayMedia: false,
      creditsInputFocused: false,
      downloadButtonShown: false,
      downloadPressed: false,
      didSearchRecommended: false,
      fileViewLogged: false,
      fullscreenMode: false,
      fileGetStarted: false,
      hasCheckedAllResolved: false,
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
      playbackStarted: false,
      playerBgHeight: 0,
      playerHeight: 0,
      uri: null,
      uriVars: null,
      showRecommended: false,
      stopDownloadConfirmed: false,
      streamingMode: false,
      viewCountFetched: false,
    };
  }

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  onComponentFocused = () => {
    StatusBar.setHidden(false);
    NativeModules.Firebase.setCurrentScreen('File').then(result => {
      const { setPlayerVisible } = this.props;

      DeviceEventEmitter.addListener('onDownloadAborted', this.handleDownloadAborted);
      DeviceEventEmitter.addListener('onStoragePermissionGranted', this.handleStoragePermissionGranted);
      DeviceEventEmitter.addListener('onStoragePermissionRefused', this.handleStoragePermissionRefused);

      const { claim, fetchMyClaims, fileInfo, isResolvingUri, resolveUri, navigation } = this.props;
      const { uri, uriVars } = navigation.state.params;
      this.setState({ uri, uriVars });

      setPlayerVisible(true, uri);
      if (!isResolvingUri && !claim) resolveUri(uri);

      this.fetchFileInfo(uri, this.props);
      this.fetchCostInfo(uri, this.props);

      fetchMyClaims();

      NativeModules.Firebase.track('open_file_page', { uri: uri });
      NativeModules.UtilityModule.keepAwakeOn();
    });
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
      fetchViewCount,
      purchasedUris: prevPurchasedUris,
      purchaseUriErrorMessage: prevPurchaseUriErrorMessage,
      navigation,
      contentType,
      notify,
      drawerStack: prevDrawerStack,
    } = this.props;
    const {
      currentRoute: prevRoute,
      failedPurchaseUris,
      fileInfo,
      purchasedUris,
      purchaseUriErrorMessage,
      streamingUrl,
      drawerStack,
      resolveUris,
    } = nextProps;
    const uri = this.getPurchaseUrl();

    if (Constants.ROUTE_FILE === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }

    if (failedPurchaseUris.includes(uri) && prevPurchaseUriErrorMessage !== purchaseUriErrorMessage) {
      if (purchaseUriErrorMessage && purchaseUriErrorMessage.trim().length > 0) {
        notify({ message: purchaseUriErrorMessage, isError: true });
      }
      this.setState({ downloadPressed: false, fileViewLogged: false, mediaLoaded: false, showRecommended: true });
    }

    const mediaType = Lbry.getMediaType(contentType);
    const isPlayable = mediaType === 'video' || mediaType === 'audio';
    if (this.state.fileGetStarted || prevPurchasedUris.length !== purchasedUris.length) {
      const { permanent_url: permanentUrl, nout, txid } = claim;
      const outpoint = `${txid}:${nout}`;
      if (this.state.fileGetStarted) {
        NativeModules.UtilityModule.queueDownload(outpoint);
        this.setState({ fileGetStarted: false });
      }

      if (purchasedUris.includes(uri) || purchasedUris.includes(permanentUrl)) {
        // If the media is playable, file/view will be done in onPlaybackStarted
        if (!isPlayable && !this.state.fileViewLogged) {
          this.logFileView(uri, claim);
        }
      }
      NativeModules.UtilityModule.checkDownloads();
    }

    if ((!fileInfo || (fileInfo && !fileInfo.completed)) && !this.state.streamingMode && isPlayable) {
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

    if (claim && !this.state.viewCountFetched) {
      this.setState({ viewCountFetched: true }, () => fetchViewCount(claim.claim_id));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { fileInfo: prevFileInfo } = this.props;
    const { fileInfo } = nextProps;

    return (
      Object.keys(this.difference(nextProps, this.props)).length > 0 ||
      Object.keys(this.difference(nextState, this.state)).length > 0
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const { claim, contentType, costInfo, fileInfo, isResolvingUri, resolveUri, navigation, title } = this.props;
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

    // attempt to retrieve images and html/text automatically once the claim is loaded, and it's free
    const mediaType = Lbry.getMediaType(contentType);
    const isPlayable = mediaType === 'video' || mediaType === 'audio';
    const isViewable = mediaType === 'image' || mediaType === 'text';
    if (claim && costInfo && costInfo.cost === 0 && !this.state.autoGetAttempted && isViewable) {
      this.setState({ autoGetAttempted: true }, () => this.checkStoragePermissionForDownload());
    }

    if (((costInfo && costInfo.cost > 0) || !isPlayable) && (!fileInfo && !isViewable) && !this.state.showRecommended) {
      this.setState({ showRecommended: true });
    }

    if (
      !fileInfo &&
      !this.state.autoDownloadStarted &&
      claim &&
      costInfo &&
      costInfo.cost === 0 &&
      (isPlayable || (this.state.uriVars && this.state.uriVars.download === 'true'))
    ) {
      this.setState({ autoDownloadStarted: true }, () => {
        if (!isPlayable) {
          this.checkStoragePermissionForDownload();
        } else {
          this.confirmPurchaseUri(claim.permanent_url, costInfo, !isPlayable);
        }
        NativeModules.UtilityModule.checkDownloads();
      });
    }
  }

  fetchFileInfo(uri, props) {
    if (props.fileInfo === undefined) {
      props.fetchFileInfo(uri);
    }
  }

  fetchCostInfo(uri, props) {
    if (props.costInfo === undefined) {
      props.fetchCostInfo(uri);
    }
  }

  handleFullscreenToggle = isFullscreen => {
    const { toggleFullscreenMode } = this.props;
    toggleFullscreenMode(isFullscreen);

    if (isFullscreen) {
      // fullscreen, so change orientation to landscape mode
      NativeModules.ScreenOrientation.lockOrientationLandscape();

      // hide the navigation bar (on devices that have the soft navigation bar)
      NativeModules.UtilityModule.hideNavigationBar();
    } else {
      // Switch back to portrait mode when the media is not fullscreen
      NativeModules.ScreenOrientation.lockOrientationPortrait();

      // show the navigation bar (on devices that have the soft navigation bar)
      NativeModules.UtilityModule.showNavigationBar();
    }

    this.setState({ fullscreenMode: isFullscreen });
    StatusBar.setHidden(isFullscreen);
  };

  onEditPressed = () => {
    const { claim, navigation } = this.props;
    navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH, params: { editMode: true, claimToEdit: claim } });
  };

  onDeletePressed = () => {
    const { abandonClaim, claim, deleteFile, deletePurchasedUri, myClaimUris, fileInfo, navigation } = this.props;

    Alert.alert(
      __('Delete file'),
      __('Are you sure you want to remove this file from your device?'),
      [
        { text: __('No') },
        {
          text: __('Yes'),
          onPress: () => {
            const { uri } = navigation.state.params;
            const purchaseUrl = this.getPurchaseUrl();

            deleteFile(`${claim.txid}:${claim.nout}`, true);
            deletePurchasedUri(uri);

            NativeModules.UtilityModule.deleteDownload(normalizeURI(purchaseUrl));
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
      { cancelable: true },
    );
  };

  onStopDownloadPressed = () => {
    const { deletePurchasedUri, fileInfo, navigation, notify, stopDownload } = this.props;

    Alert.alert(
      __('Stop download'),
      __('Are you sure you want to stop downloading this file?'),
      [
        { text: __('No') },
        {
          text: __('Yes'),
          onPress: () => {
            const uri = this.getPurchaseUrl();
            stopDownload(uri, fileInfo);
            deletePurchasedUri(uri);
            NativeModules.UtilityModule.deleteDownload(normalizeURI(uri));

            this.setState({
              downloadPressed: false,
              fileViewLogged: false,
              mediaLoaded: false,
              stopDownloadConfirmed: true,
            });

            // there can be a bit of lag between the user pressing Yes and the UI being updated
            // after the file_set_status and file_delete operations, so let the user know
            notify({
              message: __('The download will stop momentarily. You do not need to wait to discover something else.'),
            });
          },
        },
      ],
      { cancelable: true },
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
    DeviceEventEmitter.removeListener('onDownloadAborted', this.handleDownloadAborted);
    DeviceEventEmitter.removeListener('onStoragePermissionGranted', this.handleStoragePermissionGranted);
    DeviceEventEmitter.removeListener('onStoragePermissionRefused', this.handleStoragePermissionRefused);
  }

  handleDownloadAborted = evt => {
    const { deletePurchasedUri, fileInfo, stopDownload } = this.props;
    const { uri, outpoint } = evt;
    const purchaseUrl = normalizeURI(this.getPurchaseUrl());
    if (purchaseUrl === uri) {
      stopDownload(uri, fileInfo);
      deletePurchasedUri(uri);
      NativeModules.UtilityModule.deleteDownload(normalizeURI(uri));

      this.setState({
        downloadPressed: false,
        fileViewLogged: false,
        mediaLoaded: false,
        stopDownloadConfirmed: true,
      });
    }
  };

  handleStoragePermissionGranted = () => {
    // permission was allowed. proceed to download
    const { notify } = this.props;

    // update the configured download folder and then download
    NativeModules.UtilityModule.getDownloadDirectory().then(downloadDirectory => {
      Lbry.settings_set({
        key: 'download_dir',
        value: downloadDirectory,
      })
        .then(() => this.performDownload())
        .catch(() => {
          notify({ message: __('The file could not be downloaded to the default download directory.'), isError: true });
        });
    });
  };

  handleStoragePermissionRefused = () => {
    const { notify } = this.props;
    this.setState({ downloadPressed: false });
    notify({
      message: __('The file could not be downloaded because the permission to write to storage was not granted.'),
      isError: true,
    });
  };

  localUriForFileInfo = fileInfo => {
    if (!fileInfo) {
      return null;
    }
    return 'file://' + fileInfo.download_path;
  };

  playerUriForFileInfo = fileInfo => {
    const { streamingUrl } = this.props;
    if (!this.state.streamingMode && fileInfo && fileInfo.download_path && fileInfo.completed) {
      // take streamingMode in the state into account because if the download completes while
      // the media is already streaming, it will restart from the beginning
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

    // only fetch recommended content after playback has started
    this.setState({ playbackStarted: true, showRecommended: true });
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

  confirmPurchaseUri = (uri, costInfo, download) => {
    const { notify, purchaseUri, title } = this.props;
    if (!costInfo) {
      notify({ message: __('This content cannot be viewed at this time. Please try again in a bit.'), isError: true });
      this.fetchCostInfo(uri, this.props);
      return;
    }

    const { cost } = costInfo;
    if (costInfo.cost > 0) {
      Alert.alert(
        __('Confirm Purchase'),
        __(
          cost === 1
            ? 'This will purchase "%title%" for %amount% credit'
            : 'This will purchase "%title%" for %amount% credits',
          { title, amount: cost },
        ),
        [
          {
            text: __('OK'),
            onPress: () => purchaseUri(uri, costInfo, download),
          },
          { text: __('Cancel') },
        ],
      );
    } else {
      // Free content. Just call purchaseUri directly.
      purchaseUri(uri, costInfo, download);
    }
  };

  onFileDownloadButtonPressed = () => {
    const { claim, costInfo, contentType, purchaseUri, setPlayerVisible } = this.props;
    const mediaType = Lbry.getMediaType(contentType);
    const isPlayable = mediaType === 'video' || mediaType === 'audio';
    const isViewable = mediaType === 'image' || mediaType === 'text';

    const purchaseUrl = this.getPurchaseUrl();
    NativeModules.Firebase.track('purchase_uri', { uri: purchaseUrl });

    if (!isPlayable) {
      this.checkStoragePermissionForDownload();
    } else {
      this.confirmPurchaseUri(purchaseUrl, costInfo, !isPlayable);
    }

    if (isPlayable) {
      this.startTime = Date.now();
      this.setState({ downloadPressed: true, autoPlayMedia: true, stopDownloadConfirmed: false });
      // setPlayerVisible(purchaseUrl);
    }
    if (isViewable) {
      this.setState({ downloadPressed: true });
    }
  };

  getPurchaseUrl = () => {
    const { claim, navigation } = this.props;
    const permanentUrl = claim ? claim.permanent_url : null;

    let purchaseUrl;
    if (navigation.state.params) {
      const { uri, fullUri } = navigation.state.params;
      purchaseUrl = fullUri || permanentUrl || uri;
    }
    if (!purchaseUrl && permanentUrl) {
      purchaseUrl = permanentUrl;
    }

    return purchaseUrl;
  };

  onDownloadPressed = () => {
    this.checkStoragePermissionForDownload();
  };

  checkStoragePermissionForDownload = () => {
    // check if we the permission to write to external storage has been granted
    NativeModules.UtilityModule.canReadWriteStorage().then(canReadWrite => {
      if (!canReadWrite) {
        // request permission
        NativeModules.UtilityModule.requestStoragePermission();
      } else {
        this.performDownload();
      }
    });
  };

  performDownload = () => {
    const { claim, costInfo, fileGet, fileInfo, purchasedUris } = this.props;
    this.setState(
      {
        downloadPressed: true,
        autoPlayMedia: false,
        stopDownloadConfirmed: false,
      },
      () => {
        const url = this.getPurchaseUrl();
        if (fileInfo || purchasedUris.includes(url)) {
          // file already in library or URI already purchased, use fileGet directly
          this.setState({ fileGetStarted: true }, () => fileGet(url, true));
        } else {
          this.confirmPurchaseUri(url, costInfo, true);
        }
        NativeModules.UtilityModule.checkDownloads();
      },
    );
  };

  onBackButtonPressed = () => {
    const { navigation, drawerStack, popDrawerStack, setPlayerVisible } = this.props;
    navigateBack(navigation, drawerStack, popDrawerStack, setPlayerVisible);
  };

  onOpenFilePressed = () => {
    const { contentType, fileInfo, notify } = this.props;
    const localFileUri = this.localUriForFileInfo(fileInfo);
    const mediaType = Lbry.getMediaType(contentType);
    const isViewable = mediaType === 'image' || mediaType === 'text';
    const isPlayable = mediaType === 'video' || mediaType === 'audio';
    if (isViewable) {
      this.openFile(localFileUri, mediaType, contentType);
    } else if (isPlayable) {
      notify({ message: __('Please press the Play button.') });
    } else {
      notify({ message: __('This file cannot be displayed in the LBRY app.') });
    }
  };

  openFile = (localFileUri, mediaType, contentType) => {
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
            showRecommended: true,
          },
          () => pushDrawerStack(Constants.DRAWER_ROUTE_FILE_VIEW),
        );
      }
    }
    if (isWebViewable) {
      // show webview
      if (!this.state.showWebView) {
        this.setState(
          {
            showWebView: true,
            showRecommended: true,
          },
          () => {
            pushDrawerStack(Constants.DRAWER_ROUTE_FILE_VIEW);
          },
        );
      }
    }
  };

  handleWebViewLoad = () => {
    const { contentType, fileInfo } = this.props;
    const localFileUri = this.localUriForFileInfo(fileInfo);
    if (this.webView && ['text/markdown', 'text/md'].includes(contentType)) {
      RNFS.readFile(localFileUri, 'utf8').then(markdown => {
        if (this.webView) {
          if (!this.converter) {
            this.converter = new showdown.Converter();
          }
          const html = this.converter.makeHtml(markdown);
          this.webView.injectJavaScript(
            'document.getElementById("content").innerHTML = \'' +
              html.replace(/\n/g, '').replace(/'/g, "\\'") +
              "'; true;",
          );
        }
      });
    }
  };

  handleWebViewMessage = evt => {
    const href = evt.nativeEvent.data;
    if (href && href.startsWith('http')) {
      Linking.openURL(href);
    }
  };

  buildWebViewSource = () => {
    const { contentType, fileInfo } = this.props;
    const localFileUri = this.localUriForFileInfo(fileInfo);

    if (['text/markdown', 'text/md'].includes(contentType)) {
      let fontdecl = '';
      if (Platform.OS === 'android') {
        fontdecl = `
          @font-face {
            font-family: 'Inter';
            src: url('file:///android_asset/fonts/Inter-Regular.otf');
            font-weight: normal;
          }
          @font-face {
            font-family: 'Inter;
            src: url('file:///android_asset/fonts/Inter-Bold.otf');
            font-weight: bold;
          }
          `;
      }

      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, user-scalable=no"/>
            <style type="text/css">
              ${fontdecl}
              body { font-family: 'Inter', sans-serif; margin: 16px }
              img { width: 100%; }
            </style>
          </head>
          <body>
            <div id="content"></div>
          </body>
        </html>
        `;

      return { html };
    }

    return { uri: localFileUri };
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
      isPlayerVisible,
      isResolvingUri,
      blackListedOutpoints,
      myClaimUris,
      navigation,
      position,
      purchaseUri,
      pushDrawerStack,
      setPlayerVisible,
      thumbnail,
      title,
      viewCount,
    } = this.props;
    const { uri, autoplay } = navigation.state.params;

    const { isChannel } = parseURI(uri);
    const myChannelUris = channels ? channels.map(channel => channel.permanent_url) : [];
    const ownedClaim = myClaimUris.includes(uri) || myChannelUris.includes(uri);

    let innerContent = null;
    if ((isResolvingUri && !claim) || !claim) {
      return (
        <View style={filePageStyle.pageContainer}>
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
      innerContent = (
        <View style={filePageStyle.dmcaContainer}>
          <Text style={filePageStyle.dmcaText}>
            {__(
              'In response to a complaint we received under the US Digital Millennium Copyright Act, we have blocked access to this content from our applications.',
            )}
          </Text>
          <Link style={filePageStyle.dmcaLink} href="https://lbry.com/faq/dmca" text={__('Read More')} />
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

    if (this.state.downloadPressed && canOpen && !this.state.autoOpened) {
      // automatically open a web viewable or image file after the download button is pressed
      this.setState({ autoOpened: true }, () => this.openFile(localFileUri, mediaType, contentType));
    }

    if (isChannel) {
      return <ChannelPage uri={uri} navigation={navigation} />;
    }

    return (
      <View style={filePageStyle.pageContainer}>
        {!this.state.fullscreenMode && <UriBar value={uri} navigation={navigation} />}
        {innerContent}
        {this.state.showWebView && isWebViewable && (
          <WebView
            ref={ref => {
              this.webView = ref;
            }}
            allowFileAccess
            javaScriptEnabled
            originWhiteList={['*']}
            source={this.buildWebViewSource()}
            style={filePageStyle.viewer}
            onLoad={this.handleWebViewLoad}
            injectedJavaScript={this.linkHandlerScript}
            onMessage={this.handleWebViewMessage}
          />
        )}
        {this.state.showImageViewer && (
          <ImageViewer
            style={StyleSheet.flatten(filePageStyle.viewer)}
            imageUrls={this.state.imageUrls}
            renderIndicator={() => null}
          />
        )}
        {!innerContent && !this.state.showWebView && (
          <View
            style={
              this.state.fullscreenMode ? filePageStyle.innerPageContainerFsMode : filePageStyle.innerPageContainer
            }
            onLayout={this.checkOrientation}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              style={filePageStyle.mediaContainer}
              onPress={this.onFileDownloadButtonPressed}
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
                (!completed && !this.state.streamingMode)) && (
                <FileDownloadButton
                  uri={claim && claim.permanent_url ? claim.permanent_url : uri}
                  style={filePageStyle.downloadButton}
                  openFile={() => this.openFile(localFileUri, mediaType, contentType)}
                  isPlayable={isPlayable}
                  isViewable={isViewable}
                  onFileActionPress={this.onFileDownloadButtonPressed}
                  onButtonLayout={() => this.setState({ downloadButtonShown: true })}
                />
              )}
              {!fileInfo && (
                <FilePrice
                  uri={claim && claim.permanent_url ? claim.permanent_url : uri}
                  style={filePageStyle.filePriceContainer}
                  textStyle={filePageStyle.filePriceText}
                  iconStyle={filePageStyle.filePriceIcon}
                />
              )}

              <TouchableOpacity style={filePageStyle.backButton} onPress={this.onBackButtonPressed}>
                <Icon name={'arrow-left'} size={18} style={filePageStyle.backButtonIcon} />
              </TouchableOpacity>
            </TouchableOpacity>
            {!innerContent && (this.state.streamingMode || (canLoadMedia && fileInfo && isPlayable)) && (
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
            {!innerContent &&
              (this.state.streamingMode || (canLoadMedia && fileInfo && isPlayable)) &&
              this.state.fullscreenMode && <View style={fsPlayerBgStyle} />}
            {isPlayerVisible &&
              !innerContent &&
              (this.state.streamingMode || (canLoadMedia && fileInfo && isPlayable)) && (
              <MediaPlayer
                claim={claim}
                assignPlayer={ref => {
                  this.player = ref;
                }}
                uri={uri}
                source={this.playerUriForFileInfo(fileInfo)}
                style={playerStyle}
                autoPlay
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

            {!innerContent && (
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
                  <View style={filePageStyle.titleArea}>
                    <View style={filePageStyle.titleRow}>
                      <Text style={filePageStyle.title} selectable>
                        {title}
                      </Text>
                      {isRewardContent && <Icon name="award" style={filePageStyle.rewardIcon} size={16} />}
                      <View style={filePageStyle.descriptionToggle}>
                        <Icon name={this.state.showDescription ? 'caret-up' : 'caret-down'} size={24} />
                      </View>
                    </View>
                    <Text style={filePageStyle.viewCount}>
                      {viewCount === 1 && __('%view% view', { view: viewCount })}
                      {viewCount > 1 && __('%view% views', { view: viewCount })}
                    </Text>
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

                  {!canEdit && (
                    <View style={filePageStyle.sharedLargeButton}>
                      {!this.state.downloadPressed &&
                        (!fileInfo || !fileInfo.download_path || (fileInfo.written_bytes <= 0 && !completed)) && (
                        <TouchableOpacity style={filePageStyle.innerLargeButton} onPress={this.onDownloadPressed}>
                          <Icon name={'download'} size={16} style={filePageStyle.largeButtonIcon} />
                          <Text style={filePageStyle.largeButtonText}>{__('Download')}</Text>
                        </TouchableOpacity>
                      )}

                      {this.state.downloadPressed && (!fileInfo || fileInfo.written_bytes === 0) && (
                        <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
                      )}

                      {!completed &&
                        fileInfo &&
                        fileInfo.written_bytes > 0 &&
                        fileInfo.written_bytes < fileInfo.total_bytes &&
                        !this.state.stopDownloadConfirmed && (
                        <TouchableOpacity style={filePageStyle.innerLargeButton} onPress={this.onStopDownloadPressed}>
                          <ProgressCircle
                            percent={(fileInfo.written_bytes / fileInfo.total_bytes) * 100}
                            radius={9}
                            borderWidth={2}
                            shadowColor={Colors.ActionGrey}
                            color={Colors.NextLbryGreen}
                          >
                            <Icon name={'stop'} size={6} style={filePageStyle.largeButtonIcon} />
                          </ProgressCircle>
                          <Text style={filePageStyle.largeButtonText}>{__('Stop')}</Text>
                        </TouchableOpacity>
                      )}

                      {completed && fileInfo && (
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
                            fullChannelUri,
                            setPlayerVisible,
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
                      uri={fullUri}
                      formatOptions={{ day: 'numeric', month: 'long', year: 'numeric' }}
                      show={DateTime.SHOW_DATE}
                    />
                  </View>
                  <View style={filePageStyle.subscriptionRow}>
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

                {this.state.showRecommended && (
                  <RelatedContent
                    navigation={navigation}
                    claimId={claim.claim_id}
                    title={title}
                    uri={fullUri}
                    fullUri={fullUri}
                  />
                )}
              </ScrollView>
            )}
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
}

export default FilePage;
