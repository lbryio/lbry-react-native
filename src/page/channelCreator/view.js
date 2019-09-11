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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { navigateToUri, uploadImageAsset } from 'utils/helper';
import Button from 'component/button';
import ChannelIconItem from 'component/channelIconItem';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FloatingWalletBalance from 'component/floatingWalletBalance';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import Tag from 'component/tag';
import TagSearch from 'component/tagSearch';
import UriBar from 'component/uriBar';
import channelCreatorStyle from 'styles/channelCreator';
import channelIconStyle from 'styles/channelIcon';
import seedrandom from 'seedrandom';

export default class ChannelCreator extends React.PureComponent {
  state = {
    autoStyle: null,
    canSave: false,
    claimId: null,
    currentSelectedValue: Constants.ITEM_ANONYMOUS,
    currentPhase: Constants.PHASE_LIST,
    displayName: null,
    channelNameUserEdited: false,
    newChannelTitle: '',
    newChannelName: '',
    newChannelBid: 0.1,
    addingChannel: false,
    creatingChannel: false,
    editChannelUrl: null,
    newChannelNameError: '',
    newChannelBidError: '',
    createChannelError: undefined,
    showCreateChannel: false,
    thumbnailUrl: '',
    coverImageUrl: '',

    avatarImagePickerOpen: false,
    coverImagePickerOpen: false,
    uploadingImage: false,

    autoStyles: [],
    editMode: false,
    selectionMode: false,
    selectedChannels: [],

    currentChannelName: null, // if editing, the current channel name
    description: null,
    website: null,
    email: null,
    tags: [],

    showOptionalFields: false,
    titleFocused: false,
    descriptionFocused: false,
    websiteFocused: false,
    emailFocused: false,
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

  generateAutoStyles = size => {
    const { channels = [] } = this.props;
    const autoStyles = [];
    for (let i = 0; i < size && i < channels.length; i++) {
      // seed generator using the claim_id
      const rng = seedrandom(channels[i].permanent_url); // is this efficient?
      const index = Math.floor(rng.quick() * ChannelIconItem.AUTO_THUMB_STYLES.length);
      autoStyles.push(ChannelIconItem.AUTO_THUMB_STYLES[index]);
    }
    return autoStyles;
  };

  componentWillReceiveProps(nextProps) {
    const { currentRoute, updatingChannel, updateChannelError } = nextProps;
    const { currentRoute: prevRoute, notify } = this.props;

    if (Constants.DRAWER_ROUTE_CHANNEL_CREATOR === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }

    if (this.state.updateChannelStarted && !updatingChannel) {
      if (updateChannelError && updateChannelError.length > 0) {
        notify({ message: `The channel could not be updated: ${updateChannelError}`, error: true });
      } else {
        // successful channel update
        notify({ message: 'The channel was successfully updated.' });
        this.showChannelList();
      }
    }
  }

  onComponentFocused = () => {
    const {
      balance,
      channels,
      channelName,
      fetchChannelListMine,
      fetchClaimListMine,
      fetchingChannels,
      navigation,
      pushDrawerStack,
      setPlayerVisible,
    } = this.props;

    NativeModules.Firebase.setCurrentScreen('Channels').then(result => {
      pushDrawerStack();
      setPlayerVisible();
      if (!fetchingChannels) {
        fetchChannelListMine();
      }
      if (balance > 0.1) {
        this.setState({ canSave: true });
      }

      DeviceEventEmitter.addListener('onDocumentPickerFilePicked', this.onFilePicked);
      DeviceEventEmitter.addListener('onDocumentPickerCanceled', this.onPickerCanceled);

      if (navigation.state.params) {
        const { editChannelUrl } = navigation.state.params;
        this.setState({ editChannelUrl });
      }
    });
  };

  handleModePressed = () => {
    this.setState({ showOptionalFields: !this.state.showOptionalFields });
  };

  onFilePicked = evt => {
    const { notify } = this.props;

    if (evt.path && evt.path.length > 0) {
      // check which image we're trying to upload
      // should only be one or the other, so just default to cover
      const isCover = this.state.coverImagePickerOpen;
      const fileUrl = `file://${evt.path}`;

      // set the path to local url first, before uploading
      if (isCover) {
        this.setState({ coverImageUrl: fileUrl });
      } else {
        this.setState({ thumbnailUrl: fileUrl });
      }

      this.setState(
        {
          uploadingImage: true,
          avatarImagePickerOpen: false,
          coverImagePickerOpen: false,
        },
        () => {
          uploadImageAsset(
            fileUrl,
            ({ url }) => {
              if (isCover) {
                this.setState({ coverImageUrl: url, uploadingImage: false });
              } else {
                this.setState({ thumbnailUrl: url, uploadingImage: false });
              }
            },
            error => {
              notify({ message: `The image could not be uploaded: ${error}` });
              this.setState({ uploadingImage: false });
            }
          );
        }
      );
    } else {
      // could not determine the file path
      notify({ message: 'We could not use the selected image. Please try a different image.' });
    }
  };

  onPickerCanceled = () => {
    this.setState({ avatarImagePickerOpen: false, coverImagePickerOpen: false });
  };

  componentDidUpdate() {
    const { channels = [] } = this.props;
    const { editChannelUrl } = this.state;
    if (channels.length > 0) {
      if (this.state.autoStyles.length !== channels.length) {
        this.setState({
          autoStyles: this.generateAutoStyles(channels.length),
        });
      }

      if (editChannelUrl) {
        this.setState({ editChannelUrl: null }, () => {
          let channelToEdit = null;
          for (let i = 0; i < channels.length; i++) {
            if (editChannelUrl === channels[i].permanent_url) {
              this.prepareEdit(channels[i]);
              return;
            }
          }
        });
      }
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

  handleDescriptionChange = value => {
    this.setState({ description: value });
  };

  handleWebsiteChange = value => {
    this.setState({ website: value });
  };

  handleEmailChange = value => {
    this.setState({ email: value });
  };

  handleNewChannelTitleChange = value => {
    this.setState({ newChannelTitle: value });
    if (value && !this.state.editMode && !this.state.channelNameUserEdited) {
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
    const { balance, createChannel, onChannelChange, notify, updateChannel } = this.props;
    const {
      claimId,
      coverImageUrl,
      currentChannelName,
      editMode,
      newChannelBid,
      newChannelName,
      newChannelTitle,
      description,
      email,
      tags,
      thumbnailUrl,
      website,
    } = this.state;

    if (newChannelName.trim().length === 0 || !isURIValid(newChannelName.substr(1), false)) {
      notify({ message: 'Your channel name contains invalid characters.' });
      return;
    }

    // shouldn't do this check in edit mode
    if (
      (editMode && currentChannelName !== newChannelName && this.channelExists(newChannelName)) ||
      (!editMode && this.channelExists(newChannelName))
    ) {
      // TODO: boolean check improvement?
      notify({ message: 'You have already created a channel with the same name.' });
      return;
    }

    if (newChannelBid > balance) {
      notify({ message: 'Deposit cannot be higher than your balance' });
      return;
    }

    const channelName = `@${newChannelName}`;

    this.setState({
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
      description,
      email,
      tags: tags.map(tag => {
        return { name: tag };
      }),
      website,
      cover: coverImageUrl,
      thumbnail: thumbnailUrl,
    };

    if (this.state.editMode) {
      // updateChannel
      // TODO: Change updateChannel in lby-redux to match createChannel with success and failure callbacks?
      const params = Object.assign(
        {},
        {
          claim_id: claimId,
          amount: newChannelBid,
        },
        optionalParams
      );
      this.setState({ updateChannelStarted: true }, () => updateChannel(params));
    } else {
      this.setState({ creatingChannel: true }, () =>
        createChannel(channelName, newChannelBid, optionalParams).then(success, failure)
      );
    }
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
    const { notify } = this.props;
    if (this.state.uploadingImage) {
      notify({ message: 'There is an image upload in progress. Please wait for the upload to complete.' });
      return;
    }

    this.setState(
      {
        avatarImagePickerOpen: false,
        coverImagePickerOpen: true,
      },
      () => NativeModules.UtilityModule.openDocumentPicker('image/*')
    );
  };

  onAvatarImagePress = () => {
    const { notify } = this.props;
    if (this.state.uploadingImage) {
      notify({ message: 'There is an image upload in progress. Please wait for the upload to complete.' });
      return;
    }

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
      canSave: false,
      claimId: null,
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

      currentChannelName: null,
      description: null,
      email: null,
      tags: [],
      website: null,

      showOptionalFields: false,
      titleFocused: false,
      descriptionFocused: false,
      websiteFocused: false,
      emailFocused: false,
      uploadingImage: false,
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
    const { value } = channel;

    this.setState({
      claimId: channel.claim_id,
      currentPhase: Constants.PHASE_CREATE,
      editMode: true,
      coverImageUrl: value && value.cover ? value.cover.url : null,
      currentChannelName: channel.name.substring(1),
      newChannelName: channel.name.substring(1),
      newChannelTitle: value ? value.title : null,
      newChannelBid: channel.amount,
      description: value ? value.description : null,
      email: value ? value.email : null,
      website: value ? value.website_url : null,
      tags: value && value.tags ? value.tags : [],
      thumbnailUrl: value && value.thumbnail ? value.thumbnail.url : null,
      showOptionalFields: value && (value.description || value.email || value.website_url || value.tags),
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

  handleAddTag = tag => {
    if (!tag || !this.state.canSave || this.state.creatingChannel) {
      return;
    }

    const { notify } = this.props;
    const { tags } = this.state;
    const index = tags.indexOf(tag.toLowerCase());
    if (index === -1) {
      const newTags = tags.slice();
      newTags.push(tag);
      this.setState({ tags: newTags });
    } else {
      notify({ message: __(`You already added the "${tag}" tag.`) });
    }
  };

  handleRemoveTag = tag => {
    if (!tag || !this.state.canSave || this.state.creatingChannel) {
      return;
    }

    const newTags = this.state.tags.slice();
    const index = newTags.indexOf(tag.toLowerCase());

    if (index > -1) {
      newTags.splice(index, 1);
      this.setState({ tags: newTags });
    }
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
    const { abandoningClaimIds, fetchingChannels, updatingChannel, channels = [], navigation } = this.props;
    const {
      autoStyle,
      autoStyles,
      coverImageUrl,
      currentPhase,
      canSave,
      editMode,
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
      uploadingImage,
    } = this.state;

    console.log(abandoningClaimIds);

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
            renderItem={({ item, index }) => {
              const itemAutoStyle = autoStyles.length > index ? autoStyles[index] : autoStyle; /* fallback */
              const value = item.value;
              const itemThumbnailUrl = value && value.thumbnail ? value.thumbnail.url : null;
              return (
                <TouchableOpacity
                  style={channelCreatorStyle.channelListItem}
                  onPress={() => this.handleChannelListItemPress(item)}
                  onLongPress={() => this.handleChannelListItemLongPress(item)}
                >
                  <View style={[channelCreatorStyle.channelListAvatar, itemAutoStyle]}>
                    {itemThumbnailUrl && (
                      <Image
                        style={channelCreatorStyle.avatarImage}
                        resizeMode={'cover'}
                        source={{ uri: itemThumbnailUrl }}
                      />
                    )}
                    {!itemThumbnailUrl && (
                      <Text style={channelIconStyle.autothumbCharacter}>{item.name.substring(1, 2).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={channelCreatorStyle.channelListDetails}>
                    {value && value.title && (
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
            data={channels.filter(channel => !abandoningClaimIds.includes(channel.claim_id))}
            keyExtractor={(item, index) => item.claim_id}
          />
        )}

        {currentPhase === Constants.PHASE_CREATE && (
          <ScrollView style={channelCreatorStyle.createChannelContainer}>
            <View style={channelCreatorStyle.imageSelectors}>
              <TouchableOpacity style={channelCreatorStyle.coverImageTouchArea} onPress={this.onCoverImagePress}>
                <Image
                  style={channelCreatorStyle.coverImage}
                  resizeMode={'cover'}
                  source={
                    coverImageUrl !== null && coverImageUrl.trim().length > 0
                      ? { uri: coverImageUrl }
                      : require('../../assets/default_channel_cover.png')
                  }
                />
                <View style={channelCreatorStyle.editOverlay}>
                  <Icon name={'edit'} style={channelCreatorStyle.editIcon} />
                </View>

                {this.state.uploadingImage && (
                  <View style={channelCreatorStyle.uploadProgress}>
                    <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
                    <Text style={channelCreatorStyle.uploadText}>Uploading image...</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={[channelCreatorStyle.avatarImageContainer, autoStyle]}>
                <TouchableOpacity style={channelCreatorStyle.avatarTouchArea} onPress={this.onAvatarImagePress}>
                  {thumbnailUrl !== null && thumbnailUrl.trim().length > 0 && (
                    <Image
                      style={channelCreatorStyle.avatarImage}
                      resizeMode={'cover'}
                      source={{ uri: thumbnailUrl }}
                    />
                  )}
                  {thumbnailUrl !== null && thumbnailUrl.trim().length === 0 && newChannelName.length > 1 && (
                    <Text style={channelIconStyle.autothumbCharacter}>
                      {newChannelName.substring(0, 1).toUpperCase()}
                    </Text>
                  )}

                  <View style={channelCreatorStyle.thumbnailEditOverlay}>
                    <Icon name={'edit'} style={channelCreatorStyle.editIcon} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={channelCreatorStyle.card}>
              <View style={channelCreatorStyle.textInputLayout}>
                {(this.state.titleFocused ||
                  (this.state.newChannelTitle != null && this.state.newChannelTitle.trim().length > 0)) && (
                  <Text style={channelCreatorStyle.textInputTitle}>Title</Text>
                )}
                <TextInput
                  editable={canSave && !creatingChannel && !updatingChannel}
                  style={channelCreatorStyle.inputText}
                  value={this.state.newChannelTitle}
                  onChangeText={this.handleNewChannelTitleChange}
                  placeholder={this.state.titleFocused ? '' : 'Title'}
                  underlineColorAndroid={Colors.NextLbryGreen}
                  onFocus={() => this.setState({ titleFocused: true })}
                  onBlur={() => this.setState({ titleFocused: false })}
                />
              </View>

              <View style={channelCreatorStyle.channelInputLayout}>
                {(this.state.channelNameFocused ||
                  (this.state.newChannelName != null && this.state.newChannelName.trim().length > 0)) && (
                  <Text style={channelCreatorStyle.textInputTitle}>Channel</Text>
                )}
                <View>
                  <Text style={channelCreatorStyle.channelAt}>@</Text>
                  <TextInput
                    editable={canSave && !creatingChannel && !updatingChannel}
                    style={channelCreatorStyle.channelNameInput}
                    value={this.state.newChannelName}
                    onChangeText={value => this.handleNewChannelNameChange(value, true)}
                    placeholder={this.state.channelNameFocused ? '' : 'Channel'}
                    underlineColorAndroid={Colors.NextLbryGreen}
                    onFocus={() => this.setState({ channelNameFocused: true })}
                    onBlur={() => this.setState({ channelNameFocused: false })}
                  />
                </View>
              </View>
              {newChannelNameError.length > 0 && (
                <Text style={channelCreatorStyle.inlineError}>{newChannelNameError}</Text>
              )}
              <View style={channelCreatorStyle.bidRow}>
                <Text style={channelCreatorStyle.label}>Deposit</Text>
                <TextInput
                  editable={canSave && !creatingChannel && !updatingChannel}
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

            {this.state.showOptionalFields && (
              <View style={channelCreatorStyle.card}>
                <View style={channelCreatorStyle.textInputLayout}>
                  {(this.state.descriptionFocused ||
                    (this.state.description != null && this.state.description.trim().length > 0)) && (
                    <Text style={channelCreatorStyle.textInputTitle}>Description</Text>
                  )}
                  <TextInput
                    editable={canSave && !creatingChannel && !updatingChannel}
                    style={channelCreatorStyle.inputText}
                    multiline
                    value={this.state.description}
                    onChangeText={this.handleDescriptionChange}
                    placeholder={this.state.descriptionFocused ? '' : 'Description'}
                    underlineColorAndroid={Colors.NextLbryGreen}
                    onFocus={() => this.setState({ descriptionFocused: true })}
                    onBlur={() => this.setState({ descriptionFocused: false })}
                  />
                </View>

                <View style={channelCreatorStyle.textInputLayout}>
                  {(this.state.websiteFocused ||
                    (this.state.website != null && this.state.website.trim().length > 0)) && (
                    <Text style={channelCreatorStyle.textInputTitle}>Website</Text>
                  )}
                  <TextInput
                    editable={canSave && !creatingChannel && !updatingChannel}
                    style={channelCreatorStyle.inputText}
                    value={this.state.website}
                    onChangeText={this.handleWebsiteChange}
                    placeholder={this.state.websiteFocused ? '' : 'Website'}
                    underlineColorAndroid={Colors.NextLbryGreen}
                    onFocus={() => this.setState({ websiteFocused: true })}
                    onBlur={() => this.setState({ websiteFocused: false })}
                  />
                </View>

                <View style={channelCreatorStyle.textInputLayout}>
                  {(this.state.emailFocused || (this.state.email != null && this.state.email.trim().length > 0)) && (
                    <Text style={channelCreatorStyle.textInputTitle}>Email</Text>
                  )}
                  <TextInput
                    editable={canSave && !creatingChannel && !updatingChannel}
                    style={channelCreatorStyle.inputText}
                    value={this.state.email}
                    onChangeText={this.handleEmailChange}
                    placeholder={this.state.emailFocused ? '' : 'Email'}
                    underlineColorAndroid={Colors.NextLbryGreen}
                    onFocus={() => this.setState({ emailFocused: true })}
                    onBlur={() => this.setState({ emailFocused: false })}
                  />
                </View>
              </View>
            )}

            {this.state.showOptionalFields && (
              <View style={channelCreatorStyle.card}>
                <Text style={channelCreatorStyle.cardTitle}>Tags</Text>
                <View style={channelCreatorStyle.tagList}>
                  {this.state.tags &&
                    this.state.tags.map(tag => (
                      <Tag
                        key={tag}
                        name={tag}
                        type={'remove'}
                        style={channelCreatorStyle.tag}
                        onRemovePress={this.handleRemoveTag}
                      />
                    ))}
                </View>
                <TagSearch
                  editable={canSave && !creatingChannel && !updatingChannel}
                  handleAddTag={this.handleAddTag}
                  selectedTags={this.state.tags}
                  showNsfwTags
                />
              </View>
            )}

            <View style={channelCreatorStyle.toggleContainer}>
              <Link
                text={this.state.showOptionalFields ? 'Hide optional fields' : 'Show optional fields'}
                onPress={this.handleModePressed}
                style={channelCreatorStyle.modeLink}
              />
            </View>

            <View style={channelCreatorStyle.buttonContainer}>
              {(creatingChannel || updatingChannel) && (
                <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
              )}
              {!creatingChannel && !updatingChannel && (
                <View style={channelCreatorStyle.buttons}>
                  <Link style={channelCreatorStyle.cancelLink} text="Cancel" onPress={this.handleCreateCancel} />
                  <Button
                    style={channelCreatorStyle.createButton}
                    disabled={!canSave || uploadingImage || !newChannelName || newChannelName.trim().length === 0}
                    text={editMode ? 'Update' : 'Create'}
                    onPress={this.handleCreateChannelClick}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {Constants.PHASE_CREATE !== this.state.currentPhase && <FloatingWalletBalance navigation={navigation} />}
      </View>
    );
  }
}
