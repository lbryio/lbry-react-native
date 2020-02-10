import React from 'react';
import { Lbry, parseURI } from 'lbry-redux';
import {
  ActivityIndicator,
  Clipboard,
  NativeModules,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import Button from 'component/button';
import ChannelSelector from 'component/channelSelector';
import PageHeader from 'component/pageHeader';
import RewardCard from 'component/rewardCard';
import RewardEnrolment from 'component/rewardEnrolment';
import UriBar from 'component/uriBar';
import invitesStyle from 'styles/invites';

class InvitesPage extends React.PureComponent {
  state = {
    channelName: null,
    email: null,
    inviteLink: null,
    selectedChannel: null,
  };

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
  }

  onComponentFocused = () => {
    const { fetchChannelListMine, fetchInviteStatus, pushDrawerStack, navigation, setPlayerVisible, user } = this.props;

    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Invites').then(result => {
      fetchChannelListMine();
      fetchInviteStatus();
    });
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  handleChannelChange = channelName => {
    const { channels = [] } = this.props;
    if (channels && channels.length > 0) {
      const filtered = channels.filter(c => c.name === channelName);
      if (filtered.length > 0) {
        const channel = filtered[0];
        this.setState({ channelName, inviteLink: this.getLinkForChannel(channel) });
      }
    }
  };

  getLinkForChannel = channel => {
    const parsedUrl = channel.canonical_url ? parseURI(channel.canonical_url) : parseURI(channel.permanent_url);
    const { claimId, claimName } = parsedUrl;
    return `https://lbry.tv/$/invite/${claimName}:${claimId}`;
  };

  handleInviteEmailChange = text => {
    this.setState({ email: text });
  };

  handleInvitePress = () => {
    const { inviteNew, notify } = this.props;
    const { email } = this.state;
    if (!email || email.indexOf('@') === -1) {
      return notify({
        message: __('Please enter a valid email address to send an invite to.'),
        isError: true,
      });
    }

    inviteNew(email);
  };

  componentWillReceiveProps(nextProps) {
    const { isPending: prevPending, notify } = this.props;
    const { channels = [], isPending, errorMessage } = nextProps;
    const { email } = this.state;

    if (!this.state.channelName && channels && channels.length > 0) {
      const firstChannel = channels[0];
      this.setState({ channelName: firstChannel.name, inviteLink: this.getLinkForChannel(firstChannel) });
    }

    if (prevPending && !isPending) {
      if (errorMessage && errorMessage.trim().length > 0) {
        notify({ message: errorMessage, isError: true });
      } else {
        notify({ message: __(`${email} was invited to the LBRY party!`) });
        this.setState({ email: null });
      }
    }
  }

  handleInviteLinkPress = () => {
    const { notify } = this.props;
    Clipboard.setString(this.state.inviteLink);
    notify({
      message: __('Invite link copied'),
    });
  };

  render() {
    const { fetchingInvitees, user, navigation, notify, isPending, invitees } = this.props;
    const { email, inviteLink } = this.state;
    const hasInvitees = invitees && invitees.length > 0;

    return (
      <View style={invitesStyle.container}>
        <UriBar navigation={navigation} />

        <ScrollView style={invitesStyle.scrollContainer}>
          <TouchableOpacity style={invitesStyle.rewardDriverCard} onPress={() => navigation.navigate('Rewards')}>
            <Icon name="award" size={16} style={invitesStyle.rewardDriverIcon} />
            <Text style={invitesStyle.rewardDriverText}>{__('Earn rewards for inviting your friends.')}</Text>
          </TouchableOpacity>

          <View style={invitesStyle.card}>
            <Text style={invitesStyle.title}>{__('Invite Link')}</Text>
            <Text style={invitesStyle.text}>
              {__('Share this link with friends (or enemies) and get 20 LBC when they join lbry.tv')}
            </Text>

            <Text style={invitesStyle.subTitle}>{__('Your invite link')}</Text>
            <View style={invitesStyle.row}>
              <Text selectable numberOfLines={1} style={invitesStyle.inviteLink} onPress={this.handleInviteLinkPress}>
                {this.state.inviteLink}
              </Text>
              <Button icon={'clipboard'} style={invitesStyle.button} onPress={this.handleInviteLinkPress} />
            </View>

            <Text style={invitesStyle.customizeTitle}>{__('Customize invite link')}</Text>
            <ChannelSelector
              showAnonymous={false}
              channelName={this.state.channelName}
              onChannelChange={this.handleChannelChange}
            />
          </View>

          <View style={invitesStyle.card}>
            <Text style={invitesStyle.title}>{__('Invite by Email')}</Text>
            <Text style={invitesStyle.text}>
              {__('Invite someone you know by email and earn 20 LBC when they join lbry.tv.')}
            </Text>

            <TextInput
              style={invitesStyle.emailInput}
              editable={!isPending}
              value={this.state.email}
              onChangeText={this.handleInviteEmailChange}
              placeholder={__('imaginary@friend.com')}
              underlineColorAndroid={Colors.NextLbryGreen}
            />
            <View style={invitesStyle.rightRow}>
              {isPending && (
                <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} style={invitesStyle.loading} />
              )}
              <Button
                disabled={!email || email.indexOf('@') === -1 || isPending}
                style={invitesStyle.button}
                text={__('Invite')}
                onPress={this.handleInvitePress}
              />
            </View>
          </View>

          <View style={[invitesStyle.card, invitesStyle.lastCard]}>
            <View style={invitesStyle.titleRow}>
              <Text style={invitesStyle.titleCol}>{__('Invite History')}</Text>
              {fetchingInvitees && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}
            </View>

            <Text style={invitesStyle.text}>
              {__(
                'Earn 20 LBC for inviting a friend, an enemy, a frenemy, or an enefriend. Everyone needs content freedom.',
              )}
            </Text>

            <View style={invitesStyle.invitees}>
              {hasInvitees && (
                <View style={invitesStyle.inviteesHeader}>
                  <Text style={invitesStyle.emailHeader} numberOfLines={1}>
                    {__('Email')}
                  </Text>
                  <Text style={invitesStyle.rewardHeader} numberOfLines={1}>
                    {__('Reward')}
                  </Text>
                </View>
              )}
              {hasInvitees &&
                invitees.map(invitee => (
                  <View key={invitee.email} style={invitesStyle.inviteeItem}>
                    <Text style={invitesStyle.inviteeEmail} numberOfLines={1}>
                      {invitee.email}
                    </Text>
                    <Text style={invitesStyle.rewardStatus} numberOfLines={1}>
                      {invitee.invite_reward_claimed && __('Claimed')}
                      {!invitee.invite_reward_claimed &&
                        (invitee.invite_reward_claimable ? __('Claimable') : __('Unclaimable'))}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default InvitesPage;
