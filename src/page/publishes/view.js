import React from 'react';
import { ActivityIndicator, Alert, FlatList, NativeModules, Text, TouchableOpacity, View } from 'react-native';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import EmptyStateView from 'component/emptyStateView';
import FileListItem from 'component/fileListItem';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import UriBar from 'component/uriBar';
import publishStyle from 'styles/publish';
import { __, navigateToUri } from 'utils/helper';

class PublishesPage extends React.PureComponent {
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

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;

    if (Constants.DRAWER_ROUTE_PUBLISHES === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  onComponentFocused = () => {
    const { checkPendingPublishes, fetchMyClaims, pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Publishes').then(result => {
      fetchMyClaims();
      checkPendingPublishes();
    });
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

  onEditActionPressed = () => {
    const { navigation } = this.props;
    const { selectedClaimsMap, selectedUris } = this.state;
    // only 1 item can be edited (and edit button should be visible only if there is a single selection)
    const claim = selectedClaimsMap[selectedUris[0]];
    this.onExitSelectionMode();

    navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH, params: { editMode: true, claimToEdit: claim } });
  };

  onDeleteActionPressed = () => {
    const { abandonClaim } = this.props;
    const { selectedClaimsMap } = this.state;

    // show confirm alert
    Alert.alert(
      __('Unpublish'),
      __('Are you sure you want to unpublish the selected content?'),
      [
        { text: __('No') },
        {
          text: __('Yes'),
          onPress: () => {
            const uris = Object.keys(selectedClaimsMap);
            uris.forEach(uri => {
              const { txid, nout } = selectedClaimsMap[uri];
              abandonClaim(txid, nout);
            });
            this.onExitSelectionMode();
          },
        },
      ],
      { cancelable: true }
    );
  };

  render() {
    const { fetching, navigation, uris } = this.props;
    const { selectionMode, selectedUris } = this.state;

    return (
      <View style={publishStyle.container}>
        <UriBar
          allowEdit
          navigation={navigation}
          selectionMode={selectionMode}
          selectedItemCount={selectedUris.length}
          onDeleteActionPressed={this.onDeleteActionPressed}
          onEditActionPressed={this.onEditActionPressed}
          onExitSelectionMode={this.onExitSelectionMode}
        />
        {fetching && (
          <View style={publishStyle.centered}>
            <ActivityIndicator size={'large'} color={Colors.NextLbryGreen} />
          </View>
        )}

        {!fetching && (!uris || uris.length === 0) && (
          <EmptyStateView
            message={__('It looks like you have not\npublished any content to LBRY yet.')}
            buttonText={__('Publish something new')}
            onButtonPress={() => navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH })}
          />
        )}

        {uris && uris.length > 0 && (
          <FlatList
            style={publishStyle.publishesList}
            contentContainerStyle={publishStyle.publishesScrollPadding}
            extraData={this.state}
            initialNumToRender={8}
            maxToRenderPerBatch={24}
            removeClippedSubviews
            ListFooterComponent={
              <View style={publishStyle.publishesFooter}>
                <Button
                  style={publishStyle.publishesFooterButton}
                  text={__('Publish something new')}
                  onPress={() => navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH })}
                />
              </View>
            }
            renderItem={({ item }) => (
              <FileListItem
                key={item}
                uri={item}
                style={publishStyle.listItem}
                selected={selectedUris.includes(item)}
                onPress={claim => {
                  if (selectionMode) {
                    this.handleSelectItem(item, claim);
                  } else {
                    // TODO: when shortUrl is available for my claims, navigate to that URL instead
                    navigateToUri(navigation, item);
                  }
                }}
                onLongPress={claim => this.handleItemLongPress(item, claim)}
                navigation={navigation}
              />
            )}
            data={uris}
            keyExtractor={(item, index) => item}
          />
        )}

        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}

export default PublishesPage;
