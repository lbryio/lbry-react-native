import React from 'react';
import { Text, View } from 'react-native';
import fileListStyle from 'styles/fileList';
import _ from 'lodash';

export default class VideoDuration extends React.PureComponent {
  getDurationString = duration => {
    let seconds = duration;
    const hours = Math.floor(seconds / 3600);
    seconds = duration - hours * 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    let durationString = '';
    if (hours > 0) {
      durationString += hours + ':';
    }
    durationString += _.padStart(minutes, hours > 0 ? 2 : 0, '0') + ':';
    durationString += _.padStart(seconds, 2, '0');

    return durationString;
  };

  render() {
    const { duration, style, textStyle } = this.props;
    if (!duration || isNaN(parseFloat(duration))) {
      return null;
    }

    return (
      <View style={style}>
        <Text style={textStyle}>{this.getDurationString(duration)}</Text>
      </View>
    );
  }
}
