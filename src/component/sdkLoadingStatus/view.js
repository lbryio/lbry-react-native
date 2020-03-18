import { ActivityIndicator, Text, View } from 'react-native';
import React from 'react';
import discoverStyle from 'styles/discover';
import Colors from 'styles/colors';

export default class SdkLoadingStatus extends React.PureComponent {
  render() {
    return (
      <View style={discoverStyle.sdkLoading}>
        <ActivityIndicator color={Colors.White} size={'small'} />
        <Text style={discoverStyle.sdkLoadingText}>{__('The LBRY background service is initializing...')}</Text>
      </View>
    );
  }
}
