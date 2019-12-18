import React from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { formatCredits } from 'lbry-redux';
import modalStyle from 'styles/modal';
import modalTipStyle from 'styles/modalTip';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';

export default class ModalTipView extends React.PureComponent {
  state = {
    creditsInputFocused: false,
    sendTipStarted: false,
    tipAmount: null,
  };

  handleSendTip = () => {
    const { claim, balance, notify, onSendTipFailed, onSendTipSuccessful, sendTip } = this.props;
    const { tipAmount } = this.state;

    if (tipAmount > balance) {
      notify({
        message: 'Insufficient credits',
      });
      return;
    }

    const amount = parseInt(tipAmount, 10);
    const message =
      amount === 1
        ? __('Are you sure you want to tip %amount% credit', { amount })
        : __('Are you sure you want to tip %amount% credits', { amount });

    Alert.alert(
      __('Send tip'),
      message,
      [
        { text: __('No') },
        {
          text: __('Yes'),
          onPress: () => {
            this.setState({ sendTipStarted: true }, () =>
              sendTip(
                tipAmount,
                claim.claim_id,
                false,
                () => {
                  // success
                  this.setState({ tipAmount: null, sendTipStarted: false });
                  if (onSendTipSuccessful) onSendTipSuccessful();
                },
                () => {
                  // error
                  if (onSendTipFailed) onSendTipFailed();
                }
              )
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  render() {
    const { balance, channelName, contentName, onCancelPress, onOverlayPress } = this.props;
    const canSendTip = this.state.tipAmount > 0;

    return (
      <TouchableOpacity style={modalStyle.overlay} activeOpacity={1} onPress={onOverlayPress}>
        <TouchableOpacity style={modalStyle.container} activeOpacity={1}>
          <View style={modalTipStyle.container}>
            <Text style={modalTipStyle.title} numberOfLines={1}>
              {channelName ? __('Send a tip to %channel%', { channel: channelName }) : __('Send a tip')}
            </Text>

            <View style={modalTipStyle.row}>
              <View style={modalTipStyle.amountRow}>
                <TextInput
                  editable={!this.state.sendTipStarted}
                  ref={ref => (this.tipAmountInput = ref)}
                  onChangeText={value => this.setState({ tipAmount: value })}
                  underlineColorAndroid={Colors.NextLbryGreen}
                  keyboardType={'numeric'}
                  onFocus={() => this.setState({ creditsInputFocused: true })}
                  onBlur={() => this.setState({ creditsInputFocused: false })}
                  placeholder={'0'}
                  value={this.state.tipAmount}
                  selectTextOnFocus
                  style={modalTipStyle.tipAmountInput}
                />
                <Text style={modalTipStyle.currency}>LBC</Text>
                <View style={modalTipStyle.balance}>
                  {this.state.creditsInputFocused && <Icon name="coins" size={12} />}
                  {this.state.creditsInputFocused && (
                    <Text style={modalTipStyle.balanceText}>{formatCredits(parseFloat(balance), 1, true)}</Text>
                  )}
                </View>
              </View>
              {this.state.sendTipStarted && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}
            </View>

            <View style={modalTipStyle.info}>
              <Text style={modalTipStyle.infoText}>
                {__(
                  'This will appear as a tip for %content%, which will boost its ability to be discovered while active.',
                  { content: contentName }
                )}
              </Text>
              <Link
                style={modalTipStyle.learnMoreLink}
                text={__('Learn more.')}
                href={'https://lbry.com/faq/tipping'}
              />
            </View>

            <View style={modalTipStyle.buttonRow}>
              <Link
                style={modalTipStyle.cancelTipLink}
                text={__('Cancel')}
                onPress={() => {
                  if (onCancelPress) onCancelPress();
                }}
              />
              <Button
                text={__('Send')}
                style={modalTipStyle.button}
                disabled={!canSendTip || this.state.sendTipStarted}
                onPress={this.handleSendTip}
              />
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
}
