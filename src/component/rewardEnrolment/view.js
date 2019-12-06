import React from 'react';
import { Linking, NativeModules, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Button from 'component/button';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Link from 'component/link';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import rewardStyle from 'styles/reward';

class RewardEnrolment extends React.Component {
  componentDidMount() {
    this.props.fetchRewards();
  }

  onNotInterestedPressed = () => {
    const { navigation, setClientSetting } = this.props;
    setClientSetting(Constants.SETTING_REWARDS_NOT_INTERESTED, true);
    navigation.navigate({ routeName: 'DiscoverStack' });
  };

  onEnrollPressed = () => {
    const { navigation } = this.props;
    navigation.navigate({ routeName: 'Verification', key: 'verification', params: { syncFlow: false } });
  };

  onLearnMorePressed = () => {
    Linking.openURL('https://lbry.com/faq/earn-credits');
  };

  render() {
    const { fetching, navigation, unclaimedRewardAmount, user } = this.props;

    return (
      <View style={rewardStyle.enrollContainer}>
        <View style={rewardStyle.summaryRow}>
          <Icon name="award" size={36} color={Colors.White} />
          <Text style={rewardStyle.summaryText}>
            {unclaimedRewardAmount === 1 && __('%amount% available credit', { amount: unclaimedRewardAmount })}
            {unclaimedRewardAmount !== 1 && __('%amount% available credits', { amount: unclaimedRewardAmount })}
          </Text>
        </View>

        <View style={rewardStyle.onboarding}>
          <Text style={rewardStyle.enrollDescText}>
            {__('LBRY credits allow you to purchase content, publish content, and influence the network.')}
            {'\n\n'}
            {__('You get credits for free for providing an email address and taking other basic actions.')}
            {'\n\n'}
            <Link style={rewardStyle.learnMoreLink} text={__('Learn more')} onPress={this.onLearnMorePressed} />.
          </Text>
        </View>

        <View style={rewardStyle.buttonRow}>
          <Link
            style={rewardStyle.notInterestedLink}
            text={__('Not interested')}
            onPress={this.onNotInterestedPressed}
          />
          <Button
            style={rewardStyle.enrollButton}
            theme={'light'}
            text={__('Get started')}
            onPress={this.onEnrollPressed}
          />
        </View>
      </View>
    );
  }
}

export default RewardEnrolment;
