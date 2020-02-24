import React from 'react';
import { normalizeURI, parseURI } from 'lbry-redux';
import { NativeModules, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Button from 'component/button';
import Colors from 'styles/colors';

class SubscribeButtonOverlay extends React.PureComponent {
  handlePress = () => {
    const { claim, isSubscribed, doChannelSubscribe, doChannelUnsubscribe, uri } = this.props;
    if (!claim) {
      return;
    }

    const subscriptionHandler = isSubscribed ? doChannelUnsubscribe : doChannelSubscribe;
    const { name: claimName } = claim;
    subscriptionHandler({
      channelName: claimName,
      uri: normalizeURI(uri),
    });
  };

  render() {
    const { uri, isSubscribed, style } = this.props;
    let styles = style.length ? style : [style];

    return (
      <TouchableOpacity style={styles} opacity={0.7} onPress={this.handlePress}>
        {isSubscribed && <Icon name={'heart'} size={20} solid color={Colors.Red} />}
        {!isSubscribed && <Icon name={'heart'} size={20} color={Colors.Red} />}
      </TouchableOpacity>
    );
  }
}

export default SubscribeButtonOverlay;
