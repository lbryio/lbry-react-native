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
import UriBar from 'component/uriBar';
import Link from 'component/link';
import MediaPlayer from 'component/mediaPlayer';
import RelatedContent from 'component/relatedContent';
import filePageStyle from 'styles/filePage';
import { formatLbryUrlForWeb, navigateToUri } from 'utils/helper';
import uriBarStyle from 'styles/uriBar';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ProgressCircle from 'react-native-progress-circle';
import Constants from "constants";

// This page will only be used for playing audio / video content from a remote stream URL
class LiteFilePage extends React.PureComponent {
  playerBackground = null;

  scrollView = null;

  player = null;

  state = {
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

  render() {
    const { navigation, rewardedContentClaimIds, title } = this.props;
    const { viewCount } = this.state;
    const { uri } = navigation.state.params;

    const { claimName, claimId } = parseURI(uri);
    const isRewardContent = rewardedContentClaimIds.includes(claimId);
    const channelName = null;
    const channelUri = null;

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
        {!this.state.fullscreenMode && <UriBar value={uri} navigation={navigation} />}

        <View
          style={this.state.fullscreenMode ? filePageStyle.innerPageContainerFsMode : filePageStyle.innerPageContainer}
          onLayout={this.checkOrientation}
        >
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
        </View>

        <ScrollView
          contentContainerstyle={filePageStyle.scrollContent}
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

            <TouchableOpacity
              style={filePageStyle.largeButton}
              onPress={() => this.setState({ showTipView: true })}
            >
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
                    navigateToUri(
                      navigation,
                      normalizeURI(channelUri),
                      null,
                      false,
                      null,
                      false,
                    );
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
            <RelatedContent
              navigation={navigation}
              claimId={claimId}
              title={title}
              uri={uri}
              fullUri={uri}
            />
          )}
        </ScrollView>
      </View>
    );
  }
}

export default LiteFilePage;
