import React from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { formatCredits, creditsToString } from 'lbry-redux';
import modalStyle from 'styles/modal';
import modalRepostStyle from 'styles/modalRepost';
import ChannelSelector from 'component/channelSelector';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import { logPublish } from 'utils/helper';

export default class ModalRepostView extends React.PureComponent {
  depositAmountInput;

  state = {
    channelName: null,
    creditsInputFocused: false,
    depositAmount: '0.01',
    repostName: null,
    repostStarted: false,
    showAdvanced: false,
  };

  componentDidMount() {
    const { claim, fetchChannelListMine } = this.props;
    const { name } = claim;
    fetchChannelListMine();
    this.setState({ repostName: name });
    this.checkChannelSelection(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.checkChannelSelection(nextProps);
    const { notify } = this.props;
    const { reposting, error } = nextProps;
    if (this.state.repostStarted && !reposting && error) {
      this.setState({ repostStarted: false });
      notify({ message: error, isError: true });
    }
  }

  checkChannelSelection = props => {
    const { channels = [] } = props;
    if (!this.state.channelName && channels && channels.length > 0) {
      const firstChannel = channels[0];
      this.setState({ channelName: firstChannel.name });
    }
  };

  handleChannelChange = channelName => {
    const { channels = [] } = this.props;
    if (channels && channels.length > 0) {
      const filtered = channels.filter(c => c.name === channelName);
      if (filtered.length > 0) {
        const channel = filtered[0];
        this.setState({ channelName });
      }
    }
  };

  handleRepost = () => {
    const { claim, balance, notify, repost, onRepostSuccessful, channels = [], clearError } = this.props;
    const { depositAmount, repostName, channelName } = this.state;

    if (parseInt(depositAmount, 10) > balance) {
      notify({
        message: 'Insufficient credits',
        isError: true,
      });
      return;
    }

    clearError();
    const channel = channels.filter(ch => ch.name === channelName)[0];
    this.setState({ repostStarted: true }, () => {
      repost({
        name: repostName,
        bid: creditsToString(depositAmount),
        channel_id: channel.claim_id,
        claim_id: claim.claim_id,
      }).then(repostClaim => {
        logPublish(repostClaim);
        this.setState({ repostStarted: false });
        notify({ message: __('The content was successfully reposted!') });
        if (onRepostSuccessful) onRepostSuccessful();
      });
    });
  };

  render() {
    const { balance, channels, reposting, title, onCancelPress, onOverlayPress } = this.props;
    const canRepost = !!this.state.channelName && !!this.state.repostName;
    const channelsLoaded = channels && channels.length > 0;
    const processing = this.state.repostStarted || reposting || !channelsLoaded;

    return (
      <TouchableOpacity style={modalStyle.overlay} activeOpacity={1} onPress={onOverlayPress}>
        <TouchableOpacity style={modalStyle.container} activeOpacity={1}>
          <View
            style={modalRepostStyle.container}
            onLayout={() => {
              if (this.tipAmountInput) {
                this.tipAmountInput.focus();
              }
            }}
          >
            <Text style={modalRepostStyle.title} numberOfLines={1}>
              {__('Repost %title%', { title })}
            </Text>
            <Text style={modalRepostStyle.infoText}>
              {__('Repost your favorite content to help more people discover them!')}
            </Text>

            <Text style={modalRepostStyle.label}>{__('Channel to post on')}</Text>
            <ChannelSelector
              showAnonymous={false}
              channelName={this.state.channelName}
              onChannelChange={this.handleChannelChange}
            />

            {this.state.showAdvanced && (
              <View>
                <Text style={modalRepostStyle.label}>{__('Name')}</Text>
                <View style={modalRepostStyle.nameRow}>
                  <TextInput
                    editable={false}
                    value={this.state.channelName ? `lbry://${this.state.channelName}/` : ''}
                    style={modalRepostStyle.input}
                  />
                  <TextInput
                    editable={canRepost}
                    value={this.state.repostName}
                    underlineColorAndroid={Colors.NextLbryGreen}
                    selectTextOnFocus
                    onChangeText={value => this.setState({ repostName: value })}
                    style={modalRepostStyle.input}
                  />
                </View>

                <Text style={modalRepostStyle.label}>{__('Deposit')}</Text>
                <View style={modalRepostStyle.row}>
                  <View style={modalRepostStyle.amountRow}>
                    <TextInput
                      editable={!this.state.repostStarted}
                      ref={ref => (this.depositAmountInput = ref)}
                      onChangeText={value => this.setState({ tipAmount: value })}
                      underlineColorAndroid={Colors.NextLbryGreen}
                      keyboardType={'numeric'}
                      onFocus={() => this.setState({ creditsInputFocused: true })}
                      onBlur={() => this.setState({ creditsInputFocused: false })}
                      placeholder={'0'}
                      value={this.state.depositAmount}
                      selectTextOnFocus
                      style={modalRepostStyle.depositAmountInput}
                    />
                    <Text style={modalRepostStyle.currency}>LBC</Text>
                    <View style={modalRepostStyle.balance}>
                      {this.state.creditsInputFocused && <Icon name="coins" size={12} />}
                      {this.state.creditsInputFocused && (
                        <Text style={modalRepostStyle.balanceText}>{formatCredits(parseFloat(balance), 1, true)}</Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View style={modalRepostStyle.buttonRow}>
              {!processing && (
                <Link
                  style={modalRepostStyle.cancelLink}
                  text={__('Cancel')}
                  onPress={() => {
                    if (onCancelPress) onCancelPress();
                  }}
                />
              )}

              {processing && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}

              <View style={modalRepostStyle.rightButtonRow}>
                <Link
                  style={modalRepostStyle.advancedLink}
                  text={this.state.showAdvanced ? __('Hide advanced') : __('Show advanced')}
                  onPress={() => {
                    this.setState({ showAdvanced: !this.state.showAdvanced });
                  }}
                />
                <Button
                  text={__('Repost')}
                  style={modalRepostStyle.button}
                  disabled={!canRepost || this.state.repostStarted || reposting}
                  onPress={this.handleRepost}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}
