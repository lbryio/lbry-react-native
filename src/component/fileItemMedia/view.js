import React from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import Colors from 'styles/colors';
import FastImage from 'react-native-fast-image';
import VideoDuration from 'component/videoDuration';
import autothumbStyle from 'styles/autothumb';
import fileItemMediaStyle from 'styles/fileItemMedia';

class FileItemMedia extends React.PureComponent {
  static AUTO_THUMB_STYLES = [
    autothumbStyle.autothumbPurple,
    autothumbStyle.autothumbRed,
    autothumbStyle.autothumbPink,
    autothumbStyle.autothumbIndigo,
    autothumbStyle.autothumbBlue,
    autothumbStyle.autothumbLightBlue,
    autothumbStyle.autothumbCyan,
    autothumbStyle.autothumbTeal,
    autothumbStyle.autothumbGreen,
    autothumbStyle.autothumbYellow,
    autothumbStyle.autothumbOrange,
  ];

  state = {
    imageLoadFailed: false,
  };

  componentWillMount() {
    this.setState({
      autoThumbStyle:
        FileItemMedia.AUTO_THUMB_STYLES[Math.floor(Math.random() * FileItemMedia.AUTO_THUMB_STYLES.length)],
    });
  }

  getFastImageResizeMode(resizeMode) {
    switch (resizeMode) {
      case 'contain':
        return FastImage.resizeMode.contain;
      case 'stretch':
        return FastImage.resizeMode.stretch;
      case 'center':
        return FastImage.resizeMode.center;
      default:
        return FastImage.resizeMode.cover;
    }
  }

  isThumbnailValid = thumbnail => {
    if (!thumbnail || typeof thumbnail !== 'string') {
      return false;
    }

    if (thumbnail.substring(0, 7) !== 'http://' && thumbnail.substring(0, 8) !== 'https://') {
      return false;
    }

    return true;
  };

  render() {
    let style = this.props.style;
    const { blurRadius, duration, isResolvingUri, thumbnail, title, resizeMode } = this.props;
    const atStyle = this.state.autoThumbStyle;
    if (this.isThumbnailValid(thumbnail) && !this.state.imageLoadFailed) {
      if (style == null) {
        style = fileItemMediaStyle.thumbnail;
      }

      if (blurRadius > 0) {
        // No blur radius support in FastImage yet
        return (
          <View style={style}>
            <Image
              source={{ uri: thumbnail }}
              blurRadius={blurRadius}
              resizeMode={resizeMode || 'cover'}
              style={fileItemMediaStyle.image}
            />
            {duration && (
              <VideoDuration
                duration={duration}
                style={fileItemMediaStyle.duration}
                textStyle={fileItemMediaStyle.durationText}
              />
            )}
          </View>
        );
      }

      return (
        <View style={style}>
          <FastImage
            source={{ uri: thumbnail }}
            onError={() => this.setState({ imageLoadFailed: true })}
            resizeMode={this.getFastImageResizeMode(resizeMode)}
            style={fileItemMediaStyle.image}
          />
          {duration && (
            <VideoDuration
              duration={duration}
              style={fileItemMediaStyle.duration}
              textStyle={fileItemMediaStyle.durationText}
            />
          )}
        </View>
      );
    }

    return (
      <View style={[style || fileItemMediaStyle.autothumb, atStyle]}>
        {isResolvingUri && (
          <View style={fileItemMediaStyle.resolving}>
            <ActivityIndicator color={Colors.White} size={'large'} />
            <Text style={fileItemMediaStyle.text}>Resolving...</Text>
          </View>
        )}
        {!isResolvingUri && (
          <Text style={fileItemMediaStyle.autothumbText}>
            {title &&
              title.trim().length > 0 &&
              title
                .replace(/\s+/g, '')
                .substring(0, Math.min(title.replace(' ', '').length, 5))
                .toUpperCase()}
          </Text>
        )}
        {duration && (
          <VideoDuration
            duration={duration}
            style={fileItemMediaStyle.duration}
            textStyle={fileItemMediaStyle.durationText}
          />
        )}
      </View>
    );
  }
}

export default FileItemMedia;
