import React from 'react';
import { Lbry, buildURI, normalizeURI } from 'lbry-redux';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  NativeModules,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import { navigateToUri, uriFromFileInfo } from 'utils/helper';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PageHeader from 'component/pageHeader';
import EmptyStateView from 'component/emptyStateView';
import FileListItem from 'component/fileListItem';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import StorageStatsCard from 'component/storageStatsCard';
import UriBar from 'component/uriBar';
import downloadsStyle from 'styles/downloads';
import fileListStyle from 'styles/fileList';

class DownloadsPage extends React.PureComponent {
  static navigationOptions = {
    title: 'Downloads',
  };

  state = {
    selectionMode: false,
    selectedUris: [],
    selectedClaimsMap: {},
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
  }

  onComponentFocused = () => {
    const { fetchMyClaims, fileList, pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Library');

    fetchMyClaims();
    fileList();
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_MY_LBRY === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  getFilteredUris = () => {
    const { claims, downloadedUris } = this.props;
    const claimUris = claims.map(claim => normalizeURI(`${claim.name}#${claim.claim_id}`));
    return downloadedUris.filter(uri => !claimUris.includes(uri));
  };

  getFilteredFileInfos = () => {
    const { claims, fileInfos } = this.props;
    const claimUris = claims.map(claim => normalizeURI(`${claim.name}#${claim.claim_id}`));
    return fileInfos.filter(
      fileInfo => !claimUris.includes(normalizeURI(`${fileInfo.claim_name}#${fileInfo.claim_id}`)),
    );
  };

  addOrRemoveItem = (uri, claim) => {
    const { selectedClaimsMap } = this.state;
    let selectedUris = [...this.state.selectedUris];

    if (selectedUris.includes(uri)) {
      delete selectedClaimsMap[uri];
      selectedUris.splice(selectedUris.indexOf(uri), 1);
    } else {
      selectedClaimsMap[uri] = claim;
      selectedUris.push(uri);
    }

    this.setState({ selectionMode: selectedUris.length > 0, selectedUris, selectedClaimsMap });
  };

  handleSelectItem = (uri, claim) => {
    this.addOrRemoveItem(uri, claim);
  };

  handleItemLongPress = (uri, claim) => {
    this.addOrRemoveItem(uri, claim);
  };

  onExitSelectionMode = () => {
    this.setState({ selectionMode: false, selectedUris: [], selectedClaimsMap: {} });
  };

  onDeleteActionPressed = () => {
    const { deleteFile, fileList } = this.props;
    const { selectedClaimsMap } = this.state;

    // show confirm alert
    Alert.alert(
      __('Delete files'),
      __('Are you sure you want to delete the selected content?'),
      [
        { text: __('No') },
        {
          text: __('Yes'),
          onPress: () => {
            const uris = Object.keys(selectedClaimsMap);
            uris.forEach(uri => {
              const { txid, nout, name, claim_id: claimId } = selectedClaimsMap[uri];
              if (name && claimId) {
                NativeModules.UtilityModule.deleteDownload(normalizeURI(`${name}#${claimId}`));
              }

              deleteFile(`${txid}:${nout}`, true);
            });
            this.onExitSelectionMode();
            fileList();
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  render() {
    const { fetching, claims, downloadedUris, fileInfos, navigation } = this.props;
    const { selectionMode, selectedUris } = this.state;
    const filteredUris = this.getFilteredUris();
    const hasDownloads = filteredUris && filteredUris.length > 0;

    return (
      <View style={downloadsStyle.container}>
        <UriBar
          navigation={navigation}
          selectionMode={selectionMode}
          selectedItemCount={selectedUris.length}
          onExitSelectionMode={this.onExitSelectionMode}
          onDeleteActionPressed={this.onDeleteActionPressed}
        />

        {!fetching && !hasDownloads && (
          <EmptyStateView message={__('You do not have any\ndownloaded content on this device.')} />
        )}

        <View style={downloadsStyle.subContainer}>
          {hasDownloads && <StorageStatsCard fileInfos={this.getFilteredFileInfos()} />}
          {fetching && (
            <View style={downloadsStyle.busyContainer}>
              <ActivityIndicator size="large" color={Colors.NextLbryGreen} style={downloadsStyle.loading} />
            </View>
          )}

          {!fetching && hasDownloads && (
            <FlatList
              extraData={this.state}
              style={downloadsStyle.scrollContainer}
              contentContainerStyle={downloadsStyle.scrollPadding}
              renderItem={({ item }) => (
                <FileListItem
                  autoplay
                  key={item}
                  uri={item}
                  style={fileListStyle.item}
                  selected={selectedUris.includes(item)}
                  onPress={claim => {
                    if (selectionMode) {
                      this.handleSelectItem(item, claim);
                    } else {
                      // TODO: when shortUrl is available for my claims, navigate to that URL instead
                      navigateToUri(navigation, item, { autoplay: true }, false, null);
                    }
                  }}
                  onLongPress={claim => this.handleItemLongPress(item, claim)}
                  navigation={navigation}
                />
              )}
              data={downloadedUris}
              keyExtractor={(item, index) => item}
            />
          )}
        </View>
        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}

export default DownloadsPage;
