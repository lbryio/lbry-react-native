import React from 'react';
import { NativeModules, Text, View, TouchableOpacity } from 'react-native';
import Button from '../button';
import fileDownloadButtonStyle from 'styles/fileDownloadButton';

class FileDownloadButton extends React.PureComponent {
  componentDidMount() {
    const { costInfo, fetchCostInfo, uri } = this.props;
    if (costInfo === undefined) {
      fetchCostInfo(uri);
    }
  }

  restartDownload(props) {
    const { downloading, fileInfo, uri, restartDownload } = props;

    if (
      !downloading &&
      fileInfo &&
      !fileInfo.completed &&
      fileInfo.written_bytes !== false &&
      fileInfo.written_bytes < fileInfo.total_bytes
    ) {
      restartDownload(uri, fileInfo.outpoint);
    }
  }

  render() {
    const {
      fileInfo,
      downloading,
      uri,
      costInfo,
      isPlayable,
      isViewable,
      onPlay,
      onView,
      loading,
      doPause,
      style,
      openFile,
      onFileActionPress,
      onButtonLayout,
    } = this.props;

    if (fileInfo && fileInfo.download_path && fileInfo.completed) {
      return (
        <TouchableOpacity
          onLayout={onButtonLayout}
          style={[style, fileDownloadButtonStyle.container]}
          onPress={openFile}
        >
          <Text style={fileDownloadButtonStyle.text}>{isViewable ? __('View') : __('Open')}</Text>
        </TouchableOpacity>
      );
    } else if ((fileInfo && !fileInfo.stopped) || loading || downloading) {
      const progress = fileInfo && fileInfo.written_bytes ? (fileInfo.written_bytes / fileInfo.total_bytes) * 100 : 0,
        label = fileInfo ? __('%progress%% complete', { progress: progress.toFixed(0) }) : __('Connecting...');

      return (
        <View style={[style, fileDownloadButtonStyle.container]}>
          <View style={{ width: `${progress}%`, backgroundColor: '#ff0000', position: 'absolute', left: 0, top: 0 }} />
          <Text style={fileDownloadButtonStyle.text}>{label}</Text>
        </View>
      );
    } else if (!fileInfo && !downloading) {
      if (!costInfo) {
        return (
          <View style={[style, fileDownloadButtonStyle.container]}>
            <Text style={fileDownloadButtonStyle.text}>{__('Fetching cost info...')}</Text>
          </View>
        );
      }
      return (
        <Button
          icon={isPlayable ? 'play' : null}
          text={isPlayable ? __('Play') : isViewable ? __('View') : __('Download')}
          onLayout={onButtonLayout}
          style={[style, fileDownloadButtonStyle.container]}
          onPress={onFileActionPress}
        />
      );
    }

    return null;
  }
}

export default FileDownloadButton;
