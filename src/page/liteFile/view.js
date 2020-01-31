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
  };

  getStreamUrl = uri => {};

  render() {
    const { contentUri } = this.props;

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
        </View>
      </View>
    );
  }
}

export default LiteFilePage;
