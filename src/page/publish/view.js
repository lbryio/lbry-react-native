import React from 'react';
import {
  ActivityIndicator,
  Clipboard,
  DeviceEventEmitter,
  Image,
  NativeModules,
  Picker,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import {
  isNameValid,
  buildURI,
  normalizeURI,
  parseURI,
  regexInvalidURI,
  CLAIM_VALUES,
  LICENSES,
  MATURE_TAGS,
  THUMBNAIL_STATUSES,
} from 'lbry-redux';
import { RNCamera } from 'react-native-camera';
import { generateCombination } from 'gfycat-style-urls';
import RNFS from 'react-native-fs';
import Button from 'component/button';
import ChannelSelector from 'component/channelSelector';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FastImage from 'react-native-fast-image';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import Link from 'component/link';
import PublishRewardsDriver from 'component/publishRewardsDriver';
import Tag from 'component/tag';
import TagSearch from 'component/tagSearch';
import UriBar from 'component/uriBar';
import publishStyle from 'styles/publish';
import { __, navigateToUri, uploadImageAsset } from 'utils/helper';

const languages = {
  en: 'English',
  zh: 'Chinese',
  fr: 'French',
  de: 'German',
  jp: 'Japanese',
  ru: 'Russian',
  es: 'Spanish',
  id: 'Indonesian',
  it: 'Italian',
  nl: 'Dutch',
  tr: 'Turkish',
  pl: 'Polish',
  ms: 'Malay',
  pt: 'Portuguese',
  vi: 'Vietnamese',
  th: 'Thai',
  ar: 'Arabic',
  cs: 'Czech',
  hr: 'Croatian',
  km: 'Cambodian',
  ko: 'Korean',
  no: 'Norwegian',
  ro: 'Romanian',
  hi: 'Hindi',
  el: 'Greek',
};

class PublishPage extends React.PureComponent {
  camera = null;

  state = {
    canPublish: false,
    canUseCamera: false,
    documentPickerOpen: false,
    editMode: false,
    titleFocused: false,
    descriptionFocused: false,
    loadingVideos: false,
    vanityUrl: null,

    // gallery videos
    videos: null,
    allThumbnailsChecked: false,
    checkedThumbnails: [],

    // camera
    cameraType: RNCamera.Constants.Type.back,
    videoRecordingMode: false,
    recordingVideo: false,
    showCameraOverlay: false,

    // paths and media
    uploadsPath: null,
    thumbnailPath: null,
    currentMedia: null,
    currentThumbnailUri: null,
    updatingThumbnailUri: false,
    currentPhase: null,

    // publish
    advancedMode: false,
    anonymous: true,
    channelName: CLAIM_VALUES.CHANNEL_ANONYMOUS,
    priceSet: false,

    // input data
    hasEditedContentAddress: false,
    bid: 0.1,
    description: null,
    title: null,
    language: 'en',
    license: LICENSES.NONE,
    licenseUrl: '',
    otherLicenseDescription: '',
    name: null,
    price: 0,
    currency: 'LBC',
    uri: null,
    tags: [],
    selectedChannel: null,
    uploadedThumbnailUri: null,
    vanityUrlSet: false,

    thumbnailImagePickerOpen: false,

    // other
    publishStarted: false,
  };

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    // this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
    DeviceEventEmitter.addListener('onGalleryThumbnailChecked', this.handleGalleryThumbnailChecked);
    DeviceEventEmitter.addListener('onAllGalleryThumbnailsChecked', this.handleAllGalleryThumbnailsChecked);
    DeviceEventEmitter.addListener('onDocumentPickerFilePicked', this.onFilePicked);
    DeviceEventEmitter.addListener('onDocumentPickerCanceled', this.onPickerCanceled);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
    DeviceEventEmitter.removeListener('onGalleryThumbnailChecked', this.handleGalleryThumbnailChecked);
    DeviceEventEmitter.removeListener('onAllGalleryThumbnailsChecked', this.handleAllGalleryThumbnailsChecked);
    DeviceEventEmitter.removeListener('onDocumentPickerFilePicked', this.onFilePicked);
    DeviceEventEmitter.removeListener('onDocumentPickerCanceled', this.onPickerCanceled);
  }

  handleGalleryThumbnailChecked = evt => {
    const checkedThumbnails = [...this.state.checkedThumbnails];
    const { id } = evt;
    // using checked because we only want thumbnails that can be displayed
    if (!checkedThumbnails.includes(id)) {
      checkedThumbnails.push(id);
    }
    this.setState({ checkedThumbnails });
  };

  handleAllGalleryThumbnailsChecked = () => {
    this.setState({ allThumbnailsChecked: true });
  };

  loadPendingFormState = () => {
    const { publishFormState } = this.props;
    const advancedMode = publishFormState.license !== null;
    this.setState({ ...publishFormState, advancedMode });
  };

  onComponentFocused = () => {
    const { balance, hasFormState, pushDrawerStack, setPlayerVisible, navigation } = this.props;
    NativeModules.Firebase.setCurrentScreen('Publish').then(result => {
      pushDrawerStack(Constants.DRAWER_ROUTE_PUBLISH, navigation.state.params ? navigation.state.params : null);
      setPlayerVisible();

      NativeModules.Gallery.canUseCamera().then(canUseCamera => this.setState({ canUseCamera }));
      NativeModules.Gallery.getThumbnailPath().then(thumbnailPath => this.setState({ thumbnailPath }));
      this.setState(
        {
          canPublish: balance >= 0.1,
          loadingVideos: true,
        },
        () => {
          NativeModules.Gallery.getVideos().then(videos => this.setState({ videos, loadingVideos: false }));
        }
      );

      // Check if this is an edit action
      let isEditMode = false,
        vanityUrlSet = false;
      if (navigation.state.params) {
        const { displayForm, editMode, claimToEdit, vanityUrl } = navigation.state.params;
        if (editMode) {
          this.prepareEdit(claimToEdit);
          isEditMode = true;
        } else if (vanityUrl) {
          const { claimName } = parseURI(vanityUrl);
          vanityUrlSet = true;
          this.setState({
            name: claimName,
            hasEditedContentAddress: true,
            vanityUrlSet,
            vanityUrl: claimName,
          });
        }
      }

      if (!isEditMode && hasFormState) {
        this.loadPendingFormState();
        if (vanityUrlSet) {
          // replace name with the specified vanity URL if there was one in the pending state
          this.setState({ name: this.state.vanityUrl });
        }
      }
      this.setState({ currentPhase: isEditMode || hasFormState ? Constants.PHASE_DETAILS : Constants.PHASE_SELECTOR });
    });
  };

  prepareEdit = claim => {
    const { pushDrawerStack } = this.props;
    const { amount, name, signing_channel: signingChannel, value } = claim;
    const { description, fee, languages, license, license_url: licenseUrl, tags, thumbnail, title } = value;

    let channelName;
    if (signingChannel) {
      channelName = signingChannel.name;
    }

    const thumbnailUrl = thumbnail ? thumbnail.url : null;

    // Determine the license
    let licenseType, otherLicenseDescription;
    if (!LICENSES.CC_LICENSES.some(({ value }) => value === license)) {
      if (!license || license === LICENSES.NONE || license === LICENSES.PUBLIC_DOMAIN) {
        licenseType = license;
      } else if (license && !licenseUrl && license !== LICENSES.NONE) {
        licenseType = LICENSES.COPYRIGHT;
      } else {
        licenseType = LICENSES.OTHER;
      }

      otherLicenseDescription = license;
    } else {
      licenseType = license;
    }

    this.setState(
      {
        editMode: true,
        publishStarted: false,
        currentPhase: Constants.PHASE_DETAILS,

        hasEditedContentAddress: true,
        bid: amount,
        channelName,
        description,
        language: languages && languages.length > 0 ? languages[0] : 'en', // default to English
        license: licenseType,
        licenseUrl,
        otherLicenseDescription,
        name,
        currency: fee && fee.currency ? fee.currency : 'LBC',
        price: fee && fee.amount ? fee.amount : 0,
        priceSet: fee && fee.amount > 0,
        tags: tags && tags.length > 0 ? tags : [],
        title,
        currentThumbnailUri: thumbnailUrl,
        uploadedThumbnailUri: thumbnailUrl,
        vanityUrlSet: false,
      },
      () => {
        this.handleNameChange(name);
        if (channelName) {
          this.handleChannelChange(channelName);
        }
        pushDrawerStack(Constants.DRAWER_ROUTE_PUBLISH_FORM);
      }
    );
  };

  getNewUri(name, channel) {
    const { resolveUri } = this.props;
    // If they are midway through a channel creation, treat it as anonymous until it completes
    const channelName =
      channel === CLAIM_VALUES.CHANNEL_ANONYMOUS || channel === CLAIM_VALUES.CHANNEL_NEW ? '' : channel;

    // We are only going to store the full uri, but we need to resolve the uri with and without the channel name
    let uri;
    try {
      uri = buildURI({ claimName: name, channelName });
    } catch (e) {
      // something wrong with channel or name
    }

    if (uri) {
      if (channelName) {
        // resolve without the channel name so we know the winning bid for it
        const uriLessChannel = buildURI({ claimName: name });
        resolveUri(uriLessChannel);
      }
      resolveUri(uri);
      return uri;
    }

    return '';
  }

  handleModePressed = () => {
    this.setState({ advancedMode: !this.state.advancedMode });
  };

  handlePublishPressed = () => {
    const { notify, publish, updatePublishForm } = this.props;
    const {
      editMode,
      bid,
      channelName,
      currentMedia,
      currency,
      description,
      language,
      license,
      licenseUrl,
      otherLicenseDescription,
      name,
      price,
      priceSet,
      tags,
      title,
      uploadedThumbnailUri: thumbnail,
      uri,
    } = this.state;

    if (!title || title.trim().length === 0) {
      notify({ message: 'Please provide a title' });
      return;
    }

    if (!name) {
      notify({ message: 'Please specify an address where people can find your content.' });
      return;
    }

    if (!currentMedia && !editMode) {
      // sanity check. normally shouldn't happen
      notify({ message: 'No file selected. Please select a video or take a photo before publishing.' });
      return;
    }

    const publishParams = {
      filePath: currentMedia ? currentMedia.filePath : null,
      bid: bid || 0.1,
      title: title || '',
      thumbnail,
      description: description || '',
      language,
      license,
      licenseType: license,
      licenseUrl,
      otherLicenseDescription,
      name: name || undefined,
      contentIsFree: !priceSet,
      fee: { currency, amount: price },
      uri: uri || undefined,
      channel: CLAIM_VALUES.CHANNEL_ANONYMOUS === channelName ? null : channelName,
      isStillEditing: false,
      tags: tags.map(tag => {
        return { name: tag };
      }),
    };

    updatePublishForm(publishParams);
    this.setState({ publishStarted: true }, () => publish(this.handlePublishSuccess, this.handlePublishFailure));
  };

  handlePublishSuccess = data => {
    const { clearPublishFormState, navigation, notify } = this.props;
    notify({
      message: `Your content was successfully published to ${this.state.uri}. It will be available in a few mintues.`,
    });
    clearPublishFormState();
    this.setState({ publishStarted: false });
    navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISHES, params: { publishSuccess: true } });
  };

  handlePublishFailure = error => {
    const { notify } = this.props;
    notify({ message: __('Your content could not be published at this time. Please try again.') });
    this.setState({ publishStarted: false });
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute: prevRoute, drawerStack: prevDrawerStack, notify, updatePublishFormState } = this.props;
    const { currentRoute, drawerStack, publishFormValues } = nextProps;

    if (Constants.DRAWER_ROUTE_PUBLISH === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }

    if (
      this.state.currentPhase === Constants.PHASE_DETAILS &&
      prevDrawerStack[prevDrawerStack.length - 1].route === Constants.DRAWER_ROUTE_PUBLISH_FORM &&
      drawerStack[drawerStack.length - 1].route === Constants.DRAWER_ROUTE_PUBLISH
    ) {
      // navigated back from the form
      this.showSelector();
    }
  }

  setCurrentMedia(media) {
    const { pushDrawerStack, updatePublishFormState } = this.props;
    const name = generateCombination(2, ' ', true);
    const newName = this.state.hasEditedContentAddress ? this.state.name : this.formatNameForTitle(name);
    updatePublishFormState({ currentMedia: media, name: newName });
    this.setState(
      {
        publishStarted: false,
        currentMedia: media,
        title: null, // no title autogeneration (user will fill this in)
        name: newName,
        currentPhase: Constants.PHASE_DETAILS,
      },
      () => {
        this.handleNameChange(this.state.name);
        pushDrawerStack(Constants.DRAWER_ROUTE_PUBLISH_FORM);
      }
    );
  }

  formatNameForTitle = title => {
    return title.replace(new RegExp(regexInvalidURI.source, regexInvalidURI.flags + 'g'), '-').toLowerCase();
  };

  showSelector() {
    const { clearPublishFormState, updatePublishForm } = this.props;

    this.setState(
      {
        publishStarted: false,
        documentPickerOpen: false,
        editMode: false,
        vanityUrl: null,

        currentMedia: null,
        currentThumbnailUri: null,
        currentPhase: Constants.PHASE_SELECTOR,
        updatingThumbnailUri: false,
        uploadThumbnailStarted: false,

        // publish
        advancedMode: false,
        anonymous: true,
        channelName: CLAIM_VALUES.CHANNEL_ANONYMOUS,
        priceSet: false,

        // input data
        hasEditedContentAddress: false,
        bid: 0.1,
        description: null,
        title: null,
        language: 'en',
        license: LICENSES.NONE,
        licenseUrl: '',
        otherLicenseDescription: '',
        name: null,
        price: 0,
        uri: null,
        tags: [],
        selectedChannel: null,
        uploadedThumbnailUri: null,

        thumbnailImagePickerOpen: false,

        vanityUrlSet: false,
      },
      () => {
        clearPublishFormState();
        // reset thumbnail
        updatePublishForm({ thumbnail: null });
      }
    );
  }

  handleRecordVideoPressed = () => {
    if (!this.state.showCameraOverlay) {
      this.setState({ canUseCamera: true, showCameraOverlay: true, videoRecordingMode: true });
    }
  };

  handleTakePhotoPressed = () => {
    if (!this.state.showCameraOverlay) {
      this.setState({ canUseCamera: true, showCameraOverlay: true, videoRecordingMode: false });
    }
  };

  handleUploadPressed = () => {
    if (this.state.documentPickerOpen) {
      return;
    }

    this.setState(
      {
        documentPickerOpen: true,
      },
      () => {
        NativeModules.UtilityModule.openDocumentPicker('*/*');
      }
    );
  };

  handleThumbnailUploadSuccess = ({ url }) => {
    const { updatePublishFormState } = this.props;

    this.setState({
      uploadThumbnailStarted: false,
      currentThumbnailUri: url,
      uploadedThumbnailUri: url,
    });
    updatePublishFormState({ currentThumbnailUri: url, uploadedThumbnailUri: url });
  };

  handleThumbnailUploadFailure = err => {
    const { notify } = this.props;
    this.setState({ uploadThumbnailStarted: false });
    notify({ message: 'The thumbnail could not be uploaded. Please try again.' });
  };

  onFilePicked = evt => {
    const { notify } = this.props;
    if (evt.path && evt.path.length > 0) {
      const fileUrl = `file://${evt.path}`;

      if (this.state.documentPickerOpen) {
        this.setState({ documentPickerOpen: false, thumbnailImagePickerOpen: false }, () => {
          const currentMedia = {
            id: -1,
            filePath: evt.path,
            duration: 0,
          };
          this.setCurrentMedia(currentMedia);
        });
      } else if (this.state.thumbnailImagePickerOpen) {
        this.setState(
          {
            documentPickerOpen: false,
            thumbnailImagePickerOpen: false,
            uploadThumbnailStarted: true,
            currentThumbnailUri: fileUrl,
          },
          () => {
            // upload a new thumbnail
            uploadImageAsset(fileUrl, this.handleThumbnailUploadSuccess, this.handleThumbnailUploadFailure);
          }
        );
      }
    } else {
      // could not determine the file path
      notify({ message: 'The path could not be determined. Please try a different file.' });
    }
  };

  onPickerCanceled = () => {
    this.setState({ documentPickerOpen: false, thumbnailImagePickerOpen: false });
  };

  handleCloseCameraPressed = () => {
    this.setState({ showCameraOverlay: false, videoRecordingMode: false });
  };

  getFilePathFromUri = uri => {
    return uri.substring('file://'.length);
  };

  handleCameraActionPressed = () => {
    const { pushDrawerStack } = this.props;

    // check if it's video or photo mode
    if (this.state.videoRecordingMode) {
      if (this.state.recordingVideo) {
        this.camera.stopRecording();
      } else {
        this.setState({ recordingVideo: true });

        const options = { quality: RNCamera.Constants.VideoQuality['1080p'] };
        this.camera.recordAsync(options).then(data => {
          this.setState({ recordingVideo: false });
          const currentMedia = {
            id: -1,
            filePath: this.getFilePathFromUri(data.uri),
            type: 'video/mp4', // always MP4
            duration: 0,
          };
          this.setCurrentMedia(currentMedia);
          this.setState(
            {
              currentThumbnailUri: null,
              updatingThumbnailUri: false,
              publishStarted: false,
              currentPhase: Constants.PHASE_DETAILS,
              showCameraOverlay: false,
              videoRecordingMode: false,
              recordingVideo: false,
            },
            () => pushDrawerStack(Constants.DRAWER_ROUTE_PUBLISH_FORM)
          );
        });
      }
    } else {
      const options = { quality: 0.7 };
      this.camera.takePictureAsync(options).then(data => {
        const currentMedia = {
          id: -1,
          filePath: this.getFilePathFromUri(data.uri),
          name: generateCombination(2, ' ', true),
          type: 'image/jpg', // always JPEG
          duration: 0,
        };
        this.setCurrentMedia(currentMedia);
        this.setState(
          {
            currentPhase: Constants.PHASE_DETAILS,
            currentThumbnailUri: null,
            publishStarted: false,
            updatingThumbnailUri: false,
            showCameraOverlay: false,
            videoRecordingMode: false,
          },
          () => pushDrawerStack(Constants.DRAWER_ROUTE_PUBLISH)
        );
      });
    }
  };

  handleSwitchCameraPressed = () => {
    const { cameraType } = this.state;
    this.setState({
      cameraType:
        cameraType === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back,
    });
  };

  getRandomFileId = () => {
    // generate a random id for a photo or recorded video between 1 and 20 (for creating thumbnails)
    const id = Math.floor(Math.random() * (20 - 2)) + 1;
    return '_' + id;
  };

  handlePublishAgainPressed = () => {
    this.showSelector();
  };

  handleBidChange = bid => {
    const { updatePublishFormState } = this.props;
    updatePublishFormState({ bid });
    this.setState({ bid });
  };

  handlePriceChange = price => {
    const { updatePublishFormState } = this.props;
    updatePublishFormState({ price });
    this.setState({ price });
  };

  handleNameChange = (name, userInput) => {
    const { notify, updatePublishFormState } = this.props;
    updatePublishFormState({ name });
    this.setState({ name });
    if (userInput) {
      this.setState({ hasEditedContentAddress: true });
    }

    if (!isNameValid(name, false)) {
      notify({ message: 'Your content address contains invalid characters' });
      return;
    }

    const uri = this.getNewUri(name, this.state.channelName);
    this.setState({ uri });
  };

  handleChannelChange = channel => {
    const { updatePublishFormState } = this.props;
    const { name } = this.state;
    const uri = this.getNewUri(name, channel);
    updatePublishFormState({ uri, channelName: channel, selectedChannel: channel });
    this.setState({ uri, channelName: channel, selectedChannel: channel });
  };

  handleAddTag = tag => {
    if (!tag || !this.state.canPublish || this.state.publishStarted) {
      return;
    }

    const { notify, updatePublishFormState } = this.props;
    const { tags } = this.state;
    const index = tags.indexOf(tag.toLowerCase());
    if (index === -1) {
      const newTags = tags.slice();
      newTags.push(tag);
      updatePublishFormState({ tags: newTags });
      this.setState({ tags: newTags });
    } else {
      notify({ message: __(`You already added the "${tag}" tag.`) });
    }
  };

  handleRemoveTag = tag => {
    if (!tag || !this.state.canPublish || this.state.publishStarted) {
      return;
    }

    const { updatePublishFormState } = this.props;
    const newTags = this.state.tags.slice();
    const index = newTags.indexOf(tag.toLowerCase());

    if (index > -1) {
      newTags.splice(index, 1);
      updatePublishFormState({ tags: newTags });
      this.setState({ tags: newTags });
    }
  };

  updateThumbnailUriForMedia = media => {
    if (this.state.updatingThumbnailUri) {
      return;
    }

    const { notify } = this.props;
    const { thumbnailPath } = this.state;

    this.setState({ updatingThumbnailUri: true });

    if (media.type) {
      const mediaType = media.type.substring(0, 5);
      const tempId = this.getRandomFileId();

      if (mediaType === 'video' && media.id > -1) {
        const uri = `file://${thumbnailPath}/${media.id}.png`;
        this.setState({ currentThumbnailUri: uri, updatingThumbnailUri: false });

        // upload the thumbnail
        if (!this.state.uploadedThumbnailUri) {
          this.setState({ uploadThumbnailStarted: true }, () =>
            uploadImageAsset(
              this.getFilePathFromUri(uri),
              this.handleThumbnailUploadSuccess,
              this.handleThumbnailUploadFailure
            )
          );
        }
      } else if (mediaType === 'image' || mediaType === 'video') {
        const create =
          mediaType === 'image'
            ? NativeModules.Gallery.createImageThumbnail
            : NativeModules.Gallery.createVideoThumbnail;
        create(tempId, media.filePath)
          .then(path => {
            this.setState({ currentThumbnailUri: `file://${path}`, updatingThumbnailUri: false });
            if (!this.state.uploadedThumbnailUri) {
              this.setState({ uploadThumbnailStarted: true }, () =>
                uploadImageAsset(path, this.handleThumbnailUploadSuccess, this.handleThumbnailUploadFailure)
              );
            }
          })
          .catch(err => {
            notify({ message: err });
            this.setState({ updatingThumbnailUri: false });
          });
      }
    }
  };

  handleTitleChange = title => {
    const { updatePublishFormState } = this.props;
    updatePublishFormState({ title });
    this.setState({ title });

    if (!this.state.editMode && !this.state.hasEditedContentAddress) {
      // only autogenerate url if the user has not yet edited the field
      // also shouldn't change url in edit mode
      this.setState(
        {
          name: this.formatNameForTitle(title),
        },
        () => {
          this.handleNameChange(this.state.name);
        }
      );
    }
  };

  handleCurrencyValueChange = currency => {
    const { updatePublishFormState } = this.props;
    updatePublishFormState({ currency });
    this.setState({ currency });
  };

  handleDescriptionChange = description => {
    const { updatePublishFormState } = this.props;
    updatePublishFormState({ description });
    this.setState({ description });
  };

  handleLanguageValueChange = language => {
    const { updatePublishFormState } = this.props;
    updatePublishFormState({ language });
    this.setState({ language });
  };

  handleLicenseValueChange = license => {
    const { updatePublishFormState } = this.props;

    const otherLicenseDescription = [LICENSES.COPYRIGHT, LICENSES.OTHER].includes(license)
      ? this.state.otherLicenseDescription
      : '';
    const licenseUrl = LICENSES.CC_LICENSES.reduce((value, item) => {
      if (typeof value === 'object') {
        value = license === value.value ? item.url : '';
      }
      if (license === item.value) {
        value = item.url;
      }
      return value;
    });

    updatePublishFormState({ otherLicenseDescription, license, licenseUrl });
    this.setState({ otherLicenseDescription, license, licenseUrl });
  };

  handleChangeLicenseDescription = otherLicenseDescription => {
    const { updatePublishFormState } = this.props;
    updatePublishFormState({ otherLicenseDescription });
    this.setState({ otherLicenseDescription });
  };

  handleThumbnailPressed = () => {
    const { notify } = this.props;
    if (this.state.thumbnailImagePickerOpen || this.state.uploadThumbnailStarted) {
      if (this.state.uploadThumbnailStarted) {
        notify({ message: 'A thumbnail is already being uploaded. Please wait for the upload to finish.' });
      }
      return;
    }

    this.setState(
      {
        thumbnailImagePickerOpen: true,
      },
      () => {
        NativeModules.UtilityModule.openDocumentPicker('image/*');
      }
    );
  };

  render() {
    const { balance, navigation, notify, publishFormValues } = this.props;
    const {
      allThumbnailsChecked,
      canUseCamera,
      showCameraOverlay,
      currentPhase,
      checkedThumbnails,
      loadingVideos,
      thumbnailPath,
      videos,
    } = this.state;

    let content;
    if (Constants.PHASE_SELECTOR === currentPhase) {
      content = (
        <View style={publishStyle.gallerySelector}>
          <View style={publishStyle.actionsView}>
            {canUseCamera && !showCameraOverlay && (
              <RNCamera captureAudio={false} style={publishStyle.cameraPreview} type={RNCamera.Constants.Type.back} />
            )}
            <View style={publishStyle.actionsSubView}>
              <TouchableOpacity
                style={[
                  publishStyle.record,
                  canUseCamera ? publishStyle.transparentBackground : publishStyle.actionBackground,
                ]}
                onPress={this.handleRecordVideoPressed}
              >
                <Icon name="video" size={48} color={Colors.White} />
                <Text style={publishStyle.actionText}>Record</Text>
              </TouchableOpacity>
              <View style={publishStyle.subActions}>
                <TouchableOpacity
                  style={[
                    publishStyle.photo,
                    canUseCamera ? publishStyle.transparentBackground : publishStyle.actionBackground,
                  ]}
                  onPress={this.handleTakePhotoPressed}
                >
                  <Icon name="camera" size={48} color={Colors.White} />
                  <Text style={publishStyle.actionText}>Take a photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={publishStyle.upload} onPress={this.handleUploadPressed}>
                  <Icon name="file-upload" size={48} color={Colors.White} />
                  <Text style={publishStyle.actionText}>Upload a file</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {(loadingVideos || !allThumbnailsChecked) && (
            <View style={publishStyle.loadingView}>
              <ActivityIndicator size="small" color={Colors.NextLbryGreen} />
              <Text style={publishStyle.loadingText}>Please wait while we load your videos...</Text>
            </View>
          )}
          {!loadingVideos && (!videos || videos.length === 0) && (
            <View style={publishStyle.relativeCentered}>
              <Text style={publishStyle.noVideos}>
                We could not find any videos on your device. Take a photo or record a video to get started.
              </Text>
            </View>
          )}
          {videos && thumbnailPath && allThumbnailsChecked && (
            <FlatGrid
              style={publishStyle.galleryGrid}
              initialNumToRender={18}
              maxToRenderPerBatch={24}
              removeClippedSubviews
              itemDimension={134}
              spacing={2}
              items={videos.filter(video => checkedThumbnails.includes(video.id))}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity key={index} onPress={() => this.setCurrentMedia(item)}>
                    <FastImage
                      style={publishStyle.galleryGridImage}
                      resizeMode={FastImage.resizeMode.cover}
                      source={{ uri: `file://${thumbnailPath}/${item.id}.png` }}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      );
    } else if (
      Constants.PHASE_DETAILS === this.state.currentPhase &&
      (this.state.editMode || this.state.currentMedia)
    ) {
      const { currentMedia, currentThumbnailUri } = this.state;
      if (!currentThumbnailUri && !this.state.editMode) {
        this.updateThumbnailUriForMedia(currentMedia);
      }
      content = (
        <ScrollView style={publishStyle.publishDetails}>
          <TouchableOpacity style={publishStyle.mainThumbnailContainer} onPress={this.handleThumbnailPressed}>
            <FastImage
              style={publishStyle.mainThumbnail}
              resizeMode={FastImage.resizeMode.contain}
              source={{ uri: currentThumbnailUri }}
            />

            <View style={publishStyle.thumbnailEditOverlay}>
              <Icon name={'edit'} style={publishStyle.editIcon} />
            </View>

            {this.state.uploadThumbnailStarted && (
              <View style={publishStyle.thumbnailUploadContainer}>
                <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
                <Text style={publishStyle.thumbnailUploadText}>Uploading thumbnail...</Text>
              </View>
            )}
          </TouchableOpacity>
          {!this.state.canPublish && <PublishRewardsDriver navigation={navigation} />}

          <View style={publishStyle.card}>
            <View style={publishStyle.textInputLayout}>
              {(this.state.titleFocused || (this.state.title != null && this.state.title.trim().length > 0)) && (
                <Text style={publishStyle.textInputTitle}>Title</Text>
              )}
              <TextInput
                editable={this.state.canPublish && !this.state.publishStarted}
                placeholder={this.state.titleFocused ? '' : 'Title'}
                style={publishStyle.inputText}
                value={this.state.title}
                numberOfLines={1}
                underlineColorAndroid={Colors.NextLbryGreen}
                onChangeText={this.handleTitleChange}
                onFocus={() => this.setState({ titleFocused: true })}
                onBlur={() => this.setState({ titleFocused: false })}
              />
            </View>

            <View style={publishStyle.textInputLayout}>
              {(this.state.descriptionFocused ||
                (this.state.description != null && this.state.description.trim().length > 0)) && (
                <Text style={publishStyle.textInputTitle}>Description</Text>
              )}
              <TextInput
                editable={this.state.canPublish && !this.state.publishStarted}
                multiline
                placeholder={this.state.descriptionFocused ? '' : 'Description'}
                style={publishStyle.inputText}
                value={this.state.description}
                underlineColorAndroid={Colors.NextLbryGreen}
                onChangeText={this.handleDescriptionChange}
                onFocus={() => this.setState({ descriptionFocused: true })}
                onBlur={() => this.setState({ descriptionFocused: false })}
              />
            </View>
          </View>

          <View style={publishStyle.card}>
            <Text style={publishStyle.cardTitle}>Tags</Text>
            <View style={publishStyle.tagList}>
              {this.state.tags &&
                this.state.tags.map(tag => (
                  <Tag
                    key={tag}
                    name={tag}
                    type={'remove'}
                    style={publishStyle.tag}
                    onRemovePress={this.handleRemoveTag}
                  />
                ))}
            </View>
            <TagSearch handleAddTag={this.handleAddTag} selectedTags={this.state.tags} showNsfwTags />
          </View>

          <View style={publishStyle.card}>
            <Text style={publishStyle.cardTitle}>Channel</Text>

            <ChannelSelector
              enabled={this.state.canPublish && !this.state.publishStarted}
              channelName={this.state.channelName}
              onChannelChange={this.handleChannelChange}
            />
          </View>

          <View style={publishStyle.card}>
            <View style={publishStyle.titleRow}>
              <Text style={publishStyle.cardTitle}>Price</Text>
              <View style={publishStyle.switchTitleRow}>
                <Switch value={this.state.priceSet} onValueChange={value => this.setState({ priceSet: value })} />
              </View>
            </View>

            {!this.state.priceSet && (
              <Text style={publishStyle.cardText}>Your content will be free. Press the toggle to set a price.</Text>
            )}

            {this.state.priceSet && (
              <View style={[publishStyle.inputRow, publishStyle.priceInputRow]}>
                <TextInput
                  editable={this.state.canPublish && !this.state.publishStarted}
                  placeholder={'0.00'}
                  keyboardType={'number-pad'}
                  style={publishStyle.priceInput}
                  underlineColorAndroid={Colors.NextLbryGreen}
                  numberOfLines={1}
                  value={String(this.state.price)}
                  onChangeText={this.handlePriceChange}
                />
                <Picker
                  style={publishStyle.currencyPicker}
                  enabled={this.state.canPublish && !this.state.publishStarted}
                  selectedValue={this.state.currency}
                  itemStyle={publishStyle.pickerItem}
                  onValueChange={this.handleCurrencyValueChange}
                >
                  <Picker.Item label={'LBC'} value={'LBC'} />
                  <Picker.Item label={'USD'} value={'USD'} />
                </Picker>
              </View>
            )}
          </View>

          <View style={publishStyle.card}>
            <Text style={publishStyle.cardTitle}>Content address</Text>
            <Text style={publishStyle.helpText}>
              The address where people can find your content (ex. lbry://myvideo).
              {this.state.editMode &&
                ' You cannot change this address while editing your content. If you wish to use a new address, please republish the content.'}
            </Text>

            <TextInput
              editable={!this.state.editMode && this.state.canPublish && !this.state.publishStarted}
              placeholder={'lbry://'}
              style={publishStyle.inputText}
              underlineColorAndroid={Colors.NextLbryGreen}
              numberOfLines={1}
              value={this.state.name}
              onChangeText={value => this.handleNameChange(value, true)}
            />
            <View style={publishStyle.inputRow}>
              <TextInput
                editable={this.state.canPublish && !this.state.publishStarted}
                placeholder={'0.00'}
                style={publishStyle.priceInput}
                underlineColorAndroid={Colors.NextLbryGreen}
                numberOfLines={1}
                keyboardType={'numeric'}
                value={String(this.state.bid)}
                onChangeText={this.handleBidChange}
              />
              <Text style={publishStyle.currency}>LBC</Text>
            </View>
            <Text style={publishStyle.helpText}>This LBC remains yours and the deposit can be undone at any time.</Text>
          </View>

          {this.state.advancedMode && (
            <View style={publishStyle.card}>
              <Text style={publishStyle.cardTitle}>Additional Options</Text>
              <View>
                <Text style={publishStyle.cardText}>Language</Text>
                <Picker
                  enabled={this.state.canPublish && !this.state.publishStarted}
                  selectedValue={this.state.language}
                  style={publishStyle.picker}
                  itemStyle={publishStyle.pickerItem}
                  onValueChange={this.handleLanguageValueChange}
                >
                  {Object.keys(languages).map(lang => (
                    <Picker.Item label={languages[lang]} value={lang} key={lang} />
                  ))}
                </Picker>
              </View>

              <View>
                <Text style={publishStyle.cardText}>License</Text>
                <Picker
                  enabled={this.state.canPublish && !this.state.publishStarted}
                  selectedValue={this.state.license}
                  style={publishStyle.picker}
                  itemStyle={publishStyle.pickerItem}
                  onValueChange={this.handleLicenseValueChange}
                >
                  <Picker.Item label={'None'} value={LICENSES.NONE} key={LICENSES.NONE} />
                  <Picker.Item label={'Public Domain'} value={LICENSES.PUBLIC_DOMAIN} key={LICENSES.PUBLIC_DOMAIN} />
                  {LICENSES.CC_LICENSES.map(({ value, url }) => (
                    <Picker.Item label={value} value={value} key={value} />
                  ))}
                  <Picker.Item label={'Copyrighted...'} value={LICENSES.COPYRIGHT} key={LICENSES.COPYRIGHT} />
                  <Picker.Item label={'Other...'} value={LICENSES.OTHER} key={LICENSES.OTHER} />
                </Picker>
                {[LICENSES.COPYRIGHT, LICENSES.OTHER].includes(this.state.license) && (
                  <TextInput
                    editable={this.state.canPublish && !this.state.publishStarted}
                    placeholder={'License description'}
                    style={publishStyle.inputText}
                    underlineColorAndroid={Colors.NextLbryGreen}
                    numberOfLines={1}
                    value={this.state.otherLicenseDescription}
                    onChangeText={this.handleChangeLicenseDescription}
                  />
                )}
              </View>
            </View>
          )}

          <View style={publishStyle.toggleContainer}>
            <Link
              text={this.state.advancedMode ? 'Hide extra fields' : 'Show extra fields'}
              onPress={this.handleModePressed}
              style={publishStyle.modeLink}
            />
          </View>

          <View style={publishStyle.actionButtons}>
            {this.state.publishStarted && (
              <View style={publishStyle.progress}>
                <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />
              </View>
            )}

            {!this.state.publishStarted && (
              <Link style={publishStyle.cancelLink} text="Cancel" onPress={() => this.showSelector()} />
            )}

            {!this.state.publishStarted && (
              <View style={publishStyle.rightActionButtons}>
                <Button
                  style={publishStyle.publishButton}
                  disabled={!this.state.canPublish || this.state.uploadThumbnailStarted}
                  text={this.state.editMode ? 'Save changes' : 'Publish'}
                  onPress={this.handlePublishPressed}
                />
              </View>
            )}
          </View>
        </ScrollView>
      );
    } else if (Constants.PHASE_PUBLISH === this.state.currentPhase) {
      content = (
        <ScrollView style={publishStyle.publishDetails}>
          <View style={publishStyle.successContainer}>
            <Text style={publishStyle.successTitle}>Success!</Text>
            <Text style={publishStyle.successText}>Congratulations! Your content was successfully uploaded.</Text>
            <View style={publishStyle.successRow}>
              <Link
                style={publishStyle.successUrl}
                text={this.state.uri}
                onPress={() => navigateToUri(navigation, this.state.uri)}
              />
              <TouchableOpacity
                onPress={() => {
                  Clipboard.setString(this.state.uri);
                  notify({ message: 'Copied.' });
                }}
              >
                <Icon name="clipboard" size={24} color={Colors.LbryGreen} />
              </TouchableOpacity>
            </View>
            <Text style={publishStyle.successText}>
              Your content will be live in a few minutes. In the mean time, feel free to publish more content or explore
              the app.
            </Text>
          </View>
          <View style={publishStyle.actionButtons}>
            <Button style={publishStyle.publishButton} text="Publish again" onPress={this.handlePublishAgainPressed} />
          </View>
        </ScrollView>
      );
    }

    return (
      <View style={publishStyle.container}>
        <UriBar navigation={navigation} />
        {content}
        {false && Constants.PHASE_SELECTOR !== this.state.currentPhase && (
          <FloatingWalletBalance navigation={navigation} />
        )}
        {this.state.showCameraOverlay && (
          <View style={publishStyle.cameraOverlay}>
            {this.state.canUseCamera && (
              <RNCamera
                captureAudio={this.state.videoRecordingMode}
                style={publishStyle.fullCamera}
                ref={ref => {
                  this.camera = ref;
                }}
                type={this.state.cameraType}
                flashMode={RNCamera.Constants.FlashMode.off}
                androidCameraPermissionOptions={{
                  title: 'Camera',
                  message: 'Please grant access to make use of your camera',
                  buttonPositive: 'OK',
                  buttonNegative: 'Cancel',
                }}
                androidRecordAudioPermissionOptions={{
                  title: 'Audio',
                  message: 'Please grant access to record audio',
                  buttonPositive: 'OK',
                  buttonNegative: 'Cancel',
                }}
                notAuthorizedView={
                  <View style={publishStyle.fullCentered}>
                    <Text style={publishStyle.cameraInfo}>Camera not authorized</Text>
                  </View>
                }
              />
            )}
            <View
              style={[
                publishStyle.cameraControls,
                this.state.videoRecordingMode ? publishStyle.transparentControls : publishStyle.opaqueControls,
              ]}
            >
              <View style={publishStyle.controlsRow}>
                <TouchableOpacity onPress={this.handleCloseCameraPressed} style={publishStyle.backButtonControl}>
                  <Icon name="arrow-left" size={28} color={Colors.White} />
                </TouchableOpacity>

                <View style={publishStyle.mainControlsRow}>
                  <TouchableOpacity style={publishStyle.switchCameraToggle} onPress={this.handleSwitchCameraPressed}>
                    <Feather name="rotate-cw" size={36} color={Colors.White} />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={this.handleCameraActionPressed}>
                    <View style={publishStyle.cameraAction}>
                      <Feather style={publishStyle.cameraActionIcon} name="circle" size={72} color={Colors.White} />
                      {this.state.recordingVideo && (
                        <Icon style={publishStyle.recordingIcon} name="circle" solid size={44} color={Colors.Red} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default PublishPage;
