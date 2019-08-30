import React from 'react';
import { CLAIM_VALUES, isURIValid, regexInvalidURI } from 'lbry-redux';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  FlatList,
  Image,
  NativeModules,
  Picker,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { navigateToUri } from 'utils/helper';
import Button from 'component/button';
import ChannelIconItem from 'component/channelIconItem';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FloatingWalletBalance from 'component/floatingWalletBalance';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import UriBar from 'component/uriBar';
import channelCreatorStyle from 'styles/channelCreator';
import channelIconStyle from 'styles/channelIcon';

export default class ChannelCreator extends React.PureComponent {
  state = {
    autoStyle: null,
    currentSelectedValue: Constants.ITEM_ANONYMOUS,
    currentPhase: Constants.PHASE_LIST,
    displayName: null,
    channelNameUserEdited: false,
    newChannelTitle: '',
    newChannelName: '',
    newChannelBid: 0.1,
    addingChannel: false,
    creatingChannel: false,
    newChannelNameError: '',
    newChannelBidError: '',
    createChannelError: undefined,
    showCreateChannel: false,
    thumbnailUrl: null,
    coverImageUrl: null,
    avatarImagePickerOpen: false,
    coverImagePickerOpen: false,

    editMode: false,
    selectionMode: false,
    selectedChannels: [],
  };

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
    DeviceEventEmitter.removeListener('onDocumentPickerFilePicked', this.onFilePicked);
    DeviceEventEmitter.removeListener('onDocumentPickerCanceled', this.onPickerCanceled);
  }

  componentDidMount() {
    this.setState({
      autoStyle:
        ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)],
    });

    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;

    if (Constants.DRAWER_ROUTE_CHANNEL_CREATOR === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  onComponentFocused = () => {
    const {
      channels,
      channelName,
      fetchChannelListMine,
      fetchClaimListMine,
      fetchingChannels,
      pushDrawerStack,
      setPlayerVisible,
    } = this.props;
    NativeModules.Firebase.setCurrentScreen('Channels').then(result => {
      pushDrawerStack();
      setPlayerVisible();
      if (!fetchingChannels) {
        fetchChannelListMine();
      }

      DeviceEventEmitter.addListener('onDocumentPickerFilePicked', this.onFilePicked);
      DeviceEventEmitter.addListener('onDocumentPickerCanceled', this.onPickerCanceled);
    });
  };

  onFilePicked = evt => {
    console.log(evt);
  };

  onPickerCanceled = () => {
    this.setState({ avatarImagePickerOpen: false, coverImagePickerOpen: false });
  };

  componentDidUpdate() {
    const { channelName } = this.props;
    if (this.state.currentSelectedValue !== channelName) {
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

  handleNewChannelTitleChange = value => {
    this.setState({ newChannelTitle: value });
    if (value && !this.state.channelNameUserEdited) {
      // build the channel name based on the title
      const channelName = value
        .replace(new RegExp(regexInvalidURI.source, regexInvalidURI.flags + 'g'), '')
        .toLowerCase();
      this.handleNewChannelNameChange(channelName, false);
    }
  };

  handleNewChannelNameChange = (value, userInput) => {
    const { notify } = this.props;

    let newChannelName = value,
      newChannelNameError = '';

    if (newChannelName.startsWith('@')) {
      newChannelName = newChannelName.slice(1);
    }

    if (newChannelName.trim().length > 0 && !isURIValid(newChannelName)) {
      newChannelNameError = 'Your channel name contains invalid characters.';
    } else if (this.channelExists(newChannelName)) {
      newChannelNameError = 'You have already created a channel with the same name.';
    }

    if (userInput) {
      this.setState({ channelNameUserEdited: true });
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
    const { newChannelBid, newChannelName, newChannelTitle } = this.state;

    if (newChannelName.trim().length === 0 || !isURIValid(newChannelName.substr(1), false)) {
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

      // reset state and go back to the channel list
      notify({ message: 'The channel was successfully created.' });
      this.showChannelList();
    };

    const failure = () => {
      notify({ message: 'Unable to create channel due to an internal error.' });
      this.setState({
        creatingChannel: false,
      });
    };

    const optionalParams = {
      title: newChannelTitle,
    };

    createChannel(channelName, newChannelBid, optionalParams).then(success, failure);
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

  onCoverImagePress = () => {
    this.setState(
      {
        avatarImagePickerOpen: false,
        coverImagePickerOpen: true,
      },
      () => NativeModules.UtilityModule.openDocumentPicker('image/*')
    );
  };

  onAvatarImagePress = () => {
    this.setState(
      {
        avatarImagePickerOpen: true,
        coverImagePickerOpen: false,
      },
      () => NativeModules.UtilityModule.openDocumentPicker('image/*')
    );
  };

  handleNewChannelPress = () => {
    this.setState({ currentPhase: Constants.PHASE_CREATE });
  };

  handleCreateCancel = () => {
    this.showChannelList();
  };

  showChannelList = () => {
    this.resetChannelCreator();
    this.setState({ currentPhase: Constants.PHASE_LIST });
  };

  resetChannelCreator = () => {
    this.setState({
      editMode: false,
      displayName: null,
      channelNameUserEdited: false,
      newChannelTitle: '',
      newChannelName: '',
      newChannelBid: 0.1,
      addingChannel: false,
      creatingChannel: false,
      newChannelNameError: '',
      newChannelBidError: '',
      createChannelError: undefined,
      showCreateChannel: false,
      thumbnailUrl: null,
      coverImageUrl: null,
      avatarImagePickerOpen: false,
      coverImagePickerOpen: false,
    });
  };

  onExitSelectionMode = () => {
    this.setState({ selectionMode: false, selectedChannels: [] });
  };

  onEditActionPressed = () => {
    const { navigation } = this.props;
    const { selectedChannels } = this.state;

    // only 1 item can be edited (and edit button should be visible only if there is a single selection)
    const channel = selectedChannels[0];
    this.onExitSelectionMode();

    this.prepareEdit(channel);
  };

  prepareEdit = channel => {
    this.setState({
      currentPhase: Constants.PHASE_CREATE,
      newChannelName: channel.name.substring(1),
      newChannelTitle: channel.meta.title ? channel.meta.title : null,
      newChannelBid: channel.amount,
    });
  };

  onDeleteActionPressed = () => {
    const { abandonClaim, fetchChannelListMine } = this.props;
    const { selectedChannels } = this.state;

    // show confirm alert
    Alert.alert(
      __('Delete channels'),
      __('Are you sure you want to delete the selected channels?'),
      [
        { text: __('No') },
        {
          text: __('Yes'),
          onPress: () => {
            selectedChannels.forEach(channel => {
              const { txid, nout } = channel;
              abandonClaim(txid, nout);
            });

            // re-fetch the channel list
            fetchChannelListMine();
            this.onExitSelectionMode();
          },
        },
      ],
      { cancelable: true }
    );
  };

  selectedChannelIndex = channel => {
    const { selectedChannels } = this.state;
    for (let i = 0; i < selectedChannels.length; i++) {
      if (selectedChannels[i].claim_id === channel.claim_id) {
        return i;
      }
    }

    return -1;
  };

  addOrRemoveItem = channel => {
    let selectedChannels = [...this.state.selectedChannels];
    const index = this.selectedChannelIndex(channel);

    if (index > -1) {
      selectedChannels.splice(index, 1);
    } else {
      selectedChannels.push(channel);
    }

    this.setState({ selectionMode: selectedChannels.length > 0, selectedChannels });
  };

  handleChannelListItemPress = channel => {
    const { navigation } = this.props;
    const { selectionMode } = this.state;
    if (selectionMode) {
      this.addOrRemoveItem(channel);
    } else {
      navigateToUri(navigation, channel.permanent_url);
    }
  };

  handleChannelListItemLongPress = channel => {
    this.addOrRemoveItem(channel);
  };

  render() {
    const { fetchingChannels, channels = [], navigation } = this.props;

    console.log(channels);

    const {
      autoStyle,
      coverImageUrl,
      currentPhase,
      newChannelName,
      newChannelNameError,
      newChannelBid,
      newChannelBidError,
      creatingChannel,
      createChannelError,
      addingChannel,
      showCreateChannel,
      thumbnailUrl,
      selectionMode,
      selectedChannels,
    } = this.state;

    return (
      <View style={channelCreatorStyle.container}>
        <UriBar
          allowEdit
          navigation={navigation}
          selectionMode={selectionMode}
          selectedItemCount={selectedChannels.length}
          onDeleteActionPressed={this.onDeleteActionPressed}
          onEditActionPressed={this.onEditActionPressed}
          onExitSelectionMode={this.onExitSelectionMode}
        />

        {currentPhase === Constants.PHASE_LIST && (
          <FlatList
            extraData={this.state}
            ListHeaderComponent={
              fetchingChannels ? (
                <View style={channelCreatorStyle.listHeader}>
                  <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              fetchingChannels ? null : (
                <View style={channelCreatorStyle.listEmpty}>
                  <Text style={channelCreatorStyle.listEmptyText}>
                    You have not created a channel. Start now by creating a new channel!
                  </Text>
                </View>
              )
            }
            ListFooterComponent={
              <View style={channelCreatorStyle.listFooter}>
                <Button
                  style={channelCreatorStyle.createChannelButton}
                  text={'Create a channel'}
                  onPress={this.handleNewChannelPress}
                />
              </View>
            }
            style={channelCreatorStyle.scrollContainer}
            contentContainerStyle={channelCreatorStyle.scrollPadding}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            removeClippedSubviews
            renderItem={({ item }) => {
              const itemAutoStyle =
                ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)];
              return (
                <TouchableOpacity
                  style={channelCreatorStyle.channelListItem}
                  onPress={() => this.handleChannelListItemPress(item)}
                  onLongPress={() => this.handleChannelListItemLongPress(item)}
                >
                  <View style={[channelCreatorStyle.channelListAvatar, itemAutoStyle]}>
                    <Text style={channelIconStyle.autothumbCharacter}>{item.name.substring(1, 2).toUpperCase()}</Text>
                  </View>
                  <View style={channelCreatorStyle.channelListDetails}>
                    {item.value && item.value.title && (
                      <Text style={channelCreatorStyle.channelListTitle}>{item.value.title}</Text>
                    )}
                    <Text style={channelCreatorStyle.channelListName}>{item.name}</Text>
                  </View>
                  {this.selectedChannelIndex(item) > -1 && (
                    <View style={channelCreatorStyle.selectedOverlay}>
                      <Icon name={'check-circle'} solid color={Colors.NextLbryGreen} size={32} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            data={channels}
            keyExtractor={(item, index) => item.claim_id}
          />
        )}

        {currentPhase === Constants.PHASE_CREATE && (
          <View style={channelCreatorStyle.createChannelContainer}>
            <View style={channelCreatorStyle.imageSelectors}>
              <TouchableOpacity style={channelCreatorStyle.coverImageTouchArea} onPress={this.onCoverImagePress}>
                <Image
                  style={channelCreatorStyle.coverImage}
                  resizeMode={'cover'}
                  source={
                    coverImageUrl && coverImageUrl.trim().length > 0
                      ? { uri: coverImageUrl }
                      : require('../../assets/default_channel_cover.png')
                  }
                />
              </TouchableOpacity>

              <View style={[channelCreatorStyle.avatarImageContainer, autoStyle]}>
                <TouchableOpacity style={channelCreatorStyle.avatarTouchArea} onPress={this.onAvatarImagePress}>
                  {thumbnailUrl && (
                    <Image
                      style={channelCreatorStyle.avatarImage}
                      resizeMode={'cover'}
                      source={{ uri: thumbnailUrl }}
                    />
                  )}
                  {(!thumbnailUrl || thumbnailUrl.trim().length === 0) && newChannelName.length > 1 && (
                    <Text style={channelIconStyle.autothumbCharacter}>
                      {newChannelName.substring(0, 1).toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={channelCreatorStyle.card}>
              <TextInput
                style={channelCreatorStyle.channelTitleInput}
                value={this.state.newChannelTitle}
                onChangeText={this.handleNewChannelTitleChange}
                placeholder={'Title'}
                underlineColorAndroid={Colors.NextLbryGreen}
              />

              <View style={channelCreatorStyle.channelInputContainer}>
                <Text style={channelCreatorStyle.channelAt}>@</Text>

                <TextInput
                  style={channelCreatorStyle.channelNameInput}
                  value={this.state.newChannelName}
                  onChangeText={value => this.handleNewChannelNameChange(value, true)}
                  placeholder={'Channel name'}
                  underlineColorAndroid={Colors.NextLbryGreen}
                />
              </View>
              {newChannelNameError.length > 0 && (
                <Text style={channelCreatorStyle.inlineError}>{newChannelNameError}</Text>
              )}
              <View style={channelCreatorStyle.bidRow}>
                <Text style={channelCreatorStyle.label}>Deposit</Text>
                <TextInput
                  style={channelCreatorStyle.bidAmountInput}
                  value={String(newChannelBid)}
                  onChangeText={this.handleNewChannelBidChange}
                  placeholder={'0.00'}
                  keyboardType={'number-pad'}
                  underlineColorAndroid={Colors.NextLbryGreen}
                />
                <Text style={channelCreatorStyle.currency}>LBC</Text>
              </View>
              <Text style={channelCreatorStyle.helpText}>
                This LBC remains yours. It is a deposit to reserve the name and can be undone at any time.
              </Text>
            </View>

            <View style={channelCreatorStyle.buttonContainer}>
              {creatingChannel && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}
              {!creatingChannel && (
                <View style={channelCreatorStyle.buttons}>
                  <Link style={channelCreatorStyle.cancelLink} text="Cancel" onPress={this.handleCreateCancel} />
                  <Button
                    style={channelCreatorStyle.createButton}
                    disabled={!(newChannelName.trim().length > 0 && newChannelBid > 0)}
                    text="Create"
                    onPress={this.handleCreateChannelClick}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}
