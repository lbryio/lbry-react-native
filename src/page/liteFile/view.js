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
import MediaPlayer from 'component/mediaPlayer';
import filePageStyle from 'styles/filePage';
import uriBarStyle from 'styles/uriBar';

// This page will only be used for playing audio / video content from a remote stream URL
class LiteFilePage extends React.PureComponent {
  playerBackground = null;

  scrollView = null;

  player = null;

  state = {
    fullscreenMode: false,
    playerHeight: null,
    isLandscape: false,
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

  getStreamUrl = uri => {
    const { claimName, claimId } = parseURI(uri);
    return `https://player.lbry.tv/content/claims/${claimName}/${claimId}/stream`;
  };

  render() {
    const { navigation } = this.props;
    const { uri } = navigation.state.params;

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
      </View>
    );
  }
}

export default LiteFilePage;
