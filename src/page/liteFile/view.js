import React from 'react';
import { Lbry, formatCredits, normalizeURI, parseURI, parseQueryParams } from 'lbry-redux';
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
import UriBar from 'component/uriBar';
import Link from 'component/link';
import MediaPlayer from 'component/mediaPlayer';
import RelatedContent from 'component/relatedContent';
import filePageStyle from 'styles/filePage';
import { decode, formatLbryUrlForWeb, navigateToUri } from 'utils/helper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import uriBarStyle from 'styles/uriBar';

// This page will only be used for playing audio / video content from a remote stream URL
class LiteFilePage extends React.PureComponent {
  playerBackground = null;

  scrollView = null;

  player = null;

  state = {
    channelName: null,
    channelUrl: null,
    contentTitle: null,
    fullscreenMode: false,
    playerHeight: null,
    isLandscape: false,
    showRecommended: false,
    viewCount: 0,
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

  getStreamUrl = url => {
    const { claimName, claimId } = parseURI(url);
    return `https://player.lbry.tv/content/claims/${claimName}/${claimId}/stream`;
  };

  handleSharePress = url => {
    const shareUrl = Constants.SHARE_BASE_URL + formatLbryUrlForWeb(url);
    NativeModules.UtilityModule.shareUrl(shareUrl);
  };

  componentDidUpdate() {
    const { navigation } = this.props;
    const { uri } = navigation.state.params;

    if (!this.state.contentTitle) {
      const params = parseQueryParams(uri);
      const { channelUrl, contentTitle } = params;
      const channelName = channelUrl ? parseURI(decode(channelUrl)).claimName : null;

      this.setState({
        title: decode(contentTitle),
        channelUrl,
        channelName,
        showRecommended: true,
      });
    }
  }

  render() {
    const { navigation, rewardedContentClaimIds } = this.props;
    const { channelName, channelUrl, title, viewCount } = this.state;
    const { uri } = navigation.state.params;
    const { claimName, claimId } = parseURI(uri);
    const isRewardContent = rewardedContentClaimIds.includes(claimId);

    const playerBgStyle = [filePageStyle.playerBackground, filePageStyle.containedPlayerBackground];
    const fsPlayerBgStyle = [filePageStyle.playerBackground, filePageStyle.fullscreenPlayerBackground];

    const playerStyle = [
      filePageStyle.player,
      this.state.isLandscape
        ? filePageStyle.containedPlayerLandscape
        : this.state.fullscreenMode
          ? filePageStyle.fullscreenPlayer
          : filePageStyle.containedPlayer,
    ];

    return (
      <View style={filePageStyle.pageContainer}>
        {!this.state.fullscreenMode && <UriBar value={uri.split('?')[0]} navigation={navigation} />}

        <View
          style={this.state.fullscreenMode ? filePageStyle.innerPageContainerFsMode : filePageStyle.innerPageContainer}
          onLayout={this.checkOrientation}
        >
          <TouchableOpacity activeOpacity={0.5} style={filePageStyle.mediaContainer} />

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

          {this.state.fullscreenMode && <View style={fsPlayerBgStyle} />}
          <MediaPlayer
            assignPlayer={ref => {
              this.player = ref;
            }}
            uri={uri}
            source={this.getStreamUrl(uri)}
            style={playerStyle}
            autoPlay
            onFullscreenToggled={this.handleFullscreenToggle}
            onLayout={evt => {
              if (!this.state.playerHeight) {
                this.setState({ playerHeight: evt.nativeEvent.layout.height });
              }
            }}
          />

          <ScrollView
            style={filePageStyle.scrollContainer}
            contentContainerStyle={filePageStyle.scrollContent}
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
                </View>
                <Text style={filePageStyle.viewCount}>
                  {viewCount === 1 && __('%view% view', { view: viewCount })}
                  {viewCount > 1 && __('%view% views', { view: viewCount })}
                </Text>
              </View>
            </TouchableWithoutFeedback>

            <View style={filePageStyle.largeButtonsRow}>
              <TouchableOpacity style={filePageStyle.largeButton} onPress={() => this.handleSharePress(uri)}>
                <Icon name={'share-alt'} size={16} style={filePageStyle.largeButtonIcon} />
                <Text style={filePageStyle.largeButtonText}>{__('Share')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={filePageStyle.largeButton} onPress={() => this.setState({ showTipView: true })}>
                <Icon name={'gift'} size={16} style={filePageStyle.largeButtonIcon} />
                <Text style={filePageStyle.largeButtonText}>{__('Tip')}</Text>
              </TouchableOpacity>
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
                      navigateToUri(navigation, normalizeURI(channelUrl), null, false, null, false);
                    }}
                  />
                )}
                {!channelName && (
                  <Text style={filePageStyle.anonChannelName} selectable ellipsizeMode={'tail'}>
                    {__('Anonymous')}
                  </Text>
                )}
              </View>
            </View>

            <View onLayout={this.setRelatedContentPosition} />

            {this.state.showRecommended && (
              <RelatedContent navigation={navigation} claimId={claimId} title={title} uri={uri} fullUri={uri} />
            )}
          </ScrollView>
        </View>
      </View>
    );
  }
}

export default LiteFilePage;
