import React from 'react';
import { CLAIM_VALUES, isNameValid } from 'lbry-redux';
import { ActivityIndicator, Picker, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import channelSelectorStyle from 'styles/channelSelector';

export default class ChannelSelector extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentSelectedValue: Constants.ITEM_ANONYMOUS,
      newChannelName: '',
      newChannelBid: 0.1,
      addingChannel: false,
      creatingChannel: false,
      newChannelNameError: '',
      newChannelBidError: '',
      createChannelError: undefined,
      showCreateChannel: false,
    };
  }

  componentDidMount() {
    const { channels = [], channelName, fetchChannelListMine, fetchingChannels } = this.props;
    if ((!channels || channels.length === 0) && !fetchingChannels) {
      fetchChannelListMine();
    }
    this.setState({ currentSelectedValue: channelName });
  }

  componentWillReceiveProps(nextProps) {
    const { channels: prevChannels = [], channelName } = this.props;
    const { channels = [] } = nextProps;

    if (channels && channels.length !== prevChannels.length && channelName !== this.state.currentSelectedValue) {
      this.setState({ currentSelectedValue: channelName });
    }
  }

  handleCreateCancel = () => {
    this.setState({ showCreateChannel: false, newChannelName: '', newChannelBid: 0.1 });
  };

  handlePickerValueChange = (itemValue, itemIndex) => {
    if (Constants.ITEM_CREATE_A_CHANNEL === itemValue) {
      this.setState({ showCreateChannel: true });
    } else {
      this.handleCreateCancel();
      this.handleChannelChange(Constants.ITEM_ANONYMOUS === itemValue ? CLAIM_VALUES.CHANNEL_ANONYMOUS : itemValue);
    }
    this.setState({ currentSelectedValue: itemValue });
  };

  handleChannelChange = value => {
    const { onChannelChange } = this.props;
    const { newChannelBid } = this.state;
    const channel = value;

    if (channel === CLAIM_VALUES.CHANNEL_NEW) {
      this.setState({ addingChannel: true });
      if (onChannelChange) {
        onChannelChange(value);
      }
      this.handleNewChannelBidChange(newChannelBid);
    } else {
      this.setState({ addingChannel: false });
      if (onChannelChange) {
        onChannelChange(value);
      }
    }
  };

  handleNewChannelNameChange = value => {
    const { notify } = this.props;

    let newChannelName = value,
      newChannelNameError = '';

    if (newChannelName.startsWith('@')) {
      newChannelName = newChannelName.slice(1);
    }

    if (newChannelName.trim().length > 0 && !isNameValid(newChannelName)) {
      newChannelNameError = 'Your channel name contains invalid characters.';
    } else if (this.channelExists(newChannelName)) {
      newChannelNameError = 'You have already created a channel with the same name.';
    }

    this.setState({
      newChannelName,
      newChannelNameError,
    });
  };

  handleNewChannelBidChange = newChannelBid => {
    const { balance, notify } = this.props;
    let newChannelBidError;
    if (newChannelBid <= 0) {
      newChannelBidError = __('Please enter a deposit above 0');
    } else if (newChannelBid === balance) {
      newChannelBidError = __('Please decrease your deposit to account for transaction fees');
    } else if (newChannelBid > balance) {
      newChannelBidError = __('Deposit cannot be higher than your balance');
    }

    notify({ message: newChannelBidError });

    this.setState({
      newChannelBid,
      newChannelBidError,
    });
  };

  handleCreateChannelClick = () => {
    const { balance, createChannel, onChannelChange, notify } = this.props;
    const { newChannelBid, newChannelName } = this.state;

    if (newChannelName.trim().length === 0 || !isNameValid(newChannelName.substr(1), false)) {
      notify({ message: 'Your channel name contains invalid characters.' });
      return;
    }

    if (this.channelExists(newChannelName)) {
      notify({ message: 'You have already created a channel with the same name.' });
      return;
    }

    if (newChannelBid > balance) {
      notify({ message: 'Deposit cannot be higher than your balance' });
      return;
    }

    const channelName = `@${newChannelName}`;

    this.setState({
      creatingChannel: true,
      createChannelError: undefined,
    });

    const success = () => {
      this.setState({
        creatingChannel: false,
        addingChannel: false,
        currentSelectedValue: channelName,
        showCreateChannel: false,
      });

      if (onChannelChange) {
        onChannelChange(channelName);
      }
    };

    const failure = () => {
      notify({ message: 'Unable to create channel due to an internal error.' });
      this.setState({
        creatingChannel: false,
      });
    };

    createChannel(channelName, newChannelBid).then(success, failure);
  };

  channelExists = name => {
    const { channels = [] } = this.props;
    for (let channel of channels) {
      if (
        name.toLowerCase() === channel.name.toLowerCase() ||
        `@${name}`.toLowerCase() === channel.name.toLowerCase()
      ) {
        return true;
      }
    }

    return false;
  };

  render() {
    const channel = this.state.addingChannel ? 'new' : this.props.channel;
    const { enabled, fetchingChannels, channels = [] } = this.props;
    const pickerItems = [Constants.ITEM_ANONYMOUS, Constants.ITEM_CREATE_A_CHANNEL].concat(
      channels ? channels.map(ch => ch.name) : []
    );

    const {
      newChannelName,
      newChannelNameError,
      newChannelBid,
      newChannelBidError,
      creatingChannel,
      createChannelError,
      addingChannel,
      showCreateChannel,
    } = this.state;

    return (
      <View style={channelSelectorStyle.container}>
        <Picker
          enabled={enabled}
          selectedValue={this.state.currentSelectedValue}
          style={channelSelectorStyle.channelPicker}
          itemStyle={channelSelectorStyle.channelPickerItem}
          onValueChange={this.handlePickerValueChange}
        >
          {pickerItems.map(item => (
            <Picker.Item label={item} value={item} key={item} />
          ))}
        </Picker>

        {showCreateChannel && (
          <View style={channelSelectorStyle.createChannelContainer}>
            <View style={channelSelectorStyle.channelInputContainer}>
              <Text style={channelSelectorStyle.channelAt}>@</Text>

              <TextInput
                style={channelSelectorStyle.channelNameInput}
                value={this.state.newChannelName}
                onChangeText={this.handleNewChannelNameChange}
                placeholder={'Channel name'}
                underlineColorAndroid={Colors.NextLbryGreen}
              />
            </View>
            {newChannelNameError.length > 0 && (
              <Text style={channelSelectorStyle.inlineError}>{newChannelNameError}</Text>
            )}
            <View style={channelSelectorStyle.bidRow}>
              <Text style={channelSelectorStyle.label}>Deposit</Text>
              <TextInput
                style={channelSelectorStyle.bidAmountInput}
                value={String(newChannelBid)}
                onChangeText={this.handleNewChannelBidChange}
                placeholder={'0.00'}
                keyboardType={'number-pad'}
                underlineColorAndroid={Colors.NextLbryGreen}
              />
              <Text style={channelSelectorStyle.currency}>LBC</Text>
            </View>
            <Text style={channelSelectorStyle.helpText}>
              This LBC remains yours. It is a deposit to reserve the name and can be undone at any time.
            </Text>

            <View style={channelSelectorStyle.buttonContainer}>
              {creatingChannel && <ActivityIndicator size={'small'} color={Colors.LbryGreen} />}
              {!creatingChannel && (
                <View style={channelSelectorStyle.buttons}>
                  <Link style={channelSelectorStyle.cancelLink} text="Cancel" onPress={this.handleCreateCancel} />
                  <Button
                    style={channelSelectorStyle.createButton}
                    disabled={!(newChannelName.trim().length > 0 && newChannelBid > 0)}
                    text="Create"
                    onPress={this.handleCreateChannelClick}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }
}
