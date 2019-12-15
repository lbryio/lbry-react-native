// @flow
import React from 'react';
import { formatCredits, regexAddress } from 'lbry-redux';
import { Alert, Clipboard, TextInput, Text, View } from 'react-native';
import Button from 'component/button';
import Colors from 'styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome5';
import walletStyle from 'styles/wallet';

type DraftTransaction = {
  address: string,
  amount: ?number, // So we can use a placeholder in the input
};

type Props = {
  sendToAddress: (string, number) => void,
  balance: number,
};

class WalletSend extends React.PureComponent<Props> {
  amountInput = null;

  state = {
    amount: null,
    address: null,
    addressChanged: false,
    addressValid: false,
    creditsInputFocused: false,
  };

  componentWillUpdate(nextProps) {
    const { draftTransaction, transactionError } = nextProps;
    if (transactionError && transactionError.trim().length > 0) {
      this.setState({ address: draftTransaction.address, amount: draftTransaction.amount });
    }
  }

  handleSend = () => {
    const { balance, sendToAddress, notify } = this.props;
    const { address, amount } = this.state;
    if (address && !regexAddress.test(address)) {
      notify({
        message: __('The recipient address is not a valid LBRY address.'),
      });
      return;
    }

    if (amount > balance) {
      notify({
        message: __('Insufficient credits'),
      });
      return;
    }

    if (amount && address) {
      // Show confirmation before send
      Alert.alert(__('Send LBC'), `Are you sure you want to send ${amount} LBC to ${address}?`, [
        { text: __('No') },
        {
          text: __('Yes'),
          onPress: () => {
            sendToAddress(address, parseFloat(amount));
            this.setState({ address: null, amount: null });
          },
        },
      ]);
    }
  };

  handleAddressInputBlur = () => {
    if (this.state.addressChanged && !this.state.addressValid) {
      const { notify } = this.props;
      notify({
        message: __('The recipient address is not a valid LBRY address.'),
      });
    }
  };

  handleAddressInputSubmit = () => {
    if (this.amountInput) {
      this.amountInput.focus();
    }
  };

  render() {
    const { balance } = this.props;
    const canSend =
      this.state.address && this.state.amount > 0 && this.state.address.trim().length > 0 && this.state.addressValid;

    return (
      <View style={walletStyle.card}>
        <Text style={walletStyle.title}>{__('Send Credits')}</Text>
        <Text style={walletStyle.text}>{__('Recipient address')}</Text>
        <View style={[walletStyle.row, walletStyle.bottomMarginMedium]}>
          <TextInput
            onChangeText={value =>
              this.setState({
                address: value,
                addressChanged: true,
                addressValid: value.trim().length === 0 || regexAddress.test(value),
              })
            }
            onBlur={this.handleAddressInputBlur}
            onSubmitEditing={this.handleAddressInputSubmit}
            placeholder={'bbFxRyXXXXXXXXXXXZD8nE7XTLUxYnddTs'}
            underlineColorAndroid={Colors.NextLbryGreen}
            value={this.state.address}
            returnKeyType={'next'}
            style={[walletStyle.input, walletStyle.addressInput, walletStyle.bottomMarginMedium]}
          />
          <Button
            icon={'paste'}
            style={walletStyle.button}
            onPress={() => Clipboard.getString().then(value => this.setState({ address: value, addressChanged: true }))}
          />
        </View>
        <Text style={walletStyle.text}>{__('Amount')}</Text>
        <View style={walletStyle.row}>
          <View style={walletStyle.amountRow}>
            <TextInput
              ref={ref => (this.amountInput = ref)}
              onChangeText={value => this.setState({ amount: value })}
              onFocus={() => this.setState({ creditsInputFocused: true })}
              onBlur={() => this.setState({ creditsInputFocused: false })}
              keyboardType={'numeric'}
              placeholder={'0'}
              underlineColorAndroid={Colors.NextLbryGreen}
              value={this.state.amount}
              style={[walletStyle.input, walletStyle.amountInput]}
            />
            <Text style={[walletStyle.text, walletStyle.currency]}>LBC</Text>
            <View style={walletStyle.balanceFocus}>
              {this.state.creditsInputFocused && <Icon name="coins" size={12} />}
              {this.state.creditsInputFocused && (
                <Text style={walletStyle.balanceText}>{formatCredits(parseFloat(balance), 1, true)}</Text>
              )}
            </View>
          </View>
          <Button
            text={__('Send')}
            style={[walletStyle.button, walletStyle.sendButton]}
            disabled={!canSend}
            onPress={this.handleSend}
          />
        </View>
      </View>
    );
  }
}

export default WalletSend;
