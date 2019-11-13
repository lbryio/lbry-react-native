import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import publishStyle from 'styles/publish';

class PublishRewardsDriver extends React.PureComponent<Props> {
  render() {
    const { navigation } = this.props;

    return (
      <TouchableOpacity style={publishStyle.rewardDriverCard} onPress={() => navigation.navigate('Rewards')}>
        <Icon name="award" size={16} style={publishStyle.rewardIcon} />
        <Text style={publishStyle.rewardDriverText}>
          {__('Publishing requires credits.')}
          {'\n'}
          {__('Tap here to get some for free.')}
        </Text>
      </TouchableOpacity>
    );
  }
}

export default PublishRewardsDriver;
