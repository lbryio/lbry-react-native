// @flow
import React from 'react';
import { SEARCH_TYPES, isNameValid, isURIValid, normalizeURI } from 'lbry-redux';
import { Dimensions, FlatList, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { navigateToUri, transformUrl } from 'utils/helper';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import UriBarItem from './internal/uri-bar-item';
import Icon from 'react-native-vector-icons/FontAwesome5';
import NavigationButton from 'component/navigationButton';
import uriBarStyle from 'styles/uriBar';

class UriBar extends React.PureComponent {
  static INPUT_TIMEOUT = 2500; // 2.5 seconds

  textInput = null;

  keyboardDidShowListener = null;

  keyboardDidHideListener = null;

  changeTextTimeout = -1;

  state = {
    currentValue: null,
    inputText: null,
    focused: false,
    keyboardHeight: 0,
  };

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentWillUnmount() {
    if (this.keyboardDidShowListener) {
      this.keyboardDidShowListener.remove();
    }
    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute, query } = nextProps;
    const { currentRoute: prevRoute } = this.props;

    if (Constants.DRAWER_ROUTE_SEARCH === currentRoute && currentRoute !== prevRoute) {
      this.setState({ currentValue: query, inputText: query });
    }
  }

  handleChangeText = text => {
    const newValue = text || '';
    clearTimeout(this.changeTextTimeout);
    const { updateSearchQuery, onSearchSubmitted, showUriBarSuggestions, navigation } = this.props;

    updateSearchQuery(text);

    this.changeTextTimeout = -1;
    if (!showUriBarSuggestions) {
      /* this.changeTextTimeout = setTimeout(() => {
        if (text.trim().length === 0) {
          // don't do anything if the text is empty
          return;
        }

        if (!text.startsWith('lbry://')) {
          // not a URI input, so this is a search, perform a direct search
          if (onSearchSubmitted) {
            onSearchSubmitted(text);
          } else {
            navigation.navigate({ routeName: 'Search', key: 'searchPage', params: { searchQuery: text } });
          }
        }
      }, UriBar.INPUT_TIMEOUT); */
    }
    this.setState({ inputText: newValue, currentValue: newValue });
  };

  handleItemPress = item => {
    const { navigation, onSearchSubmitted, updateSearchQuery } = this.props;
    const { type, value } = item;

    Keyboard.dismiss();

    if (SEARCH_TYPES.SEARCH === type) {
      this.setState({ currentValue: value }, () => this.setCaretPosition(value));
      updateSearchQuery(value);

      if (onSearchSubmitted) {
        onSearchSubmitted(value);
        return;
      }

      navigation.navigate({
        routeName: Constants.DRAWER_ROUTE_SEARCH,
        key: 'searchPage',
        params: { searchQuery: value },
      });
    } else if (SEARCH_TYPES.TAG === type) {
      navigation.navigate({
        routeName: Constants.DRAWER_ROUTE_TAG,
        key: 'tagPage',
        params: {
          tag: value.toLowerCase(),
        },
      });
    } else {
      const uri = normalizeURI(value);
      navigateToUri(navigation, uri);
    }
  };

  _keyboardDidShow = evt => {
    this.setState({ keyboardHeight: evt.endCoordinates.height });
  };

  _keyboardDidHide = () => {
    if (this.textInput) {
      this.textInput.blur();
    }
    this.setState({ focused: false, keyboardHeight: 0 });
  };

  handleSubmitEditing = () => {
    const { navigation, onSearchSubmitted, updateSearchQuery } = this.props;
    if (this.state.inputText) {
      let inputText = this.state.inputText,
        inputTextIsUrl = false;
      if (inputText.startsWith('lbry://')) {
        const transformedUrl = transformUrl(inputText);
        // if it's a URI (lbry://...), open the file page
        if (transformedUrl && isURIValid(transformedUrl)) {
          inputTextIsUrl = true;
          navigateToUri(navigation, transformedUrl);
        }
      }

      // couldn't parse the inputText as a URL for some reason, so do a search instead
      if (!inputTextIsUrl) {
        updateSearchQuery(inputText);
        // Not a URI, default to a search request
        if (onSearchSubmitted) {
          // Only the search page sets the onSearchSubmitted prop, so call this prop if set
          onSearchSubmitted(inputText);
          return;
        }

        // Open the search page with the query populated
        navigation.navigate({ routeName: 'Search', key: 'searchPage', params: { searchQuery: inputText } });
      }
    }
  };

  onSearchPageBlurred() {
    this.setState({ currenValueSet: false });
  }

  render() {
    const {
      allowEdit,
      belowOverlay,
      navigation,
      onExitSelectionMode,
      onEditActionPressed,
      onDeleteActionPressed,
      query,
      selectedItemCount,
      selectionMode,
      suggestions,
      showUriBarSuggestions,
      value,
    } = this.props;
    if (this.state.currentValue === null) {
      this.setState({ currentValue: value });
    }

    let style = [
      uriBarStyle.overlay,
      belowOverlay ? null : uriBarStyle.overlayElevated,
      this.state.focused && showUriBarSuggestions ? uriBarStyle.inFocus : null,
    ];

    // TODO: selectionModeActions should be dynamically created / specified
    return (
      <View style={style}>
        <View style={[uriBarStyle.uriContainer, belowOverlay ? null : uriBarStyle.containerElevated]}>
          {selectionMode && (
            <View style={uriBarStyle.selectionModeBar}>
              <View style={uriBarStyle.selectionModeLeftBar}>
                <TouchableOpacity
                  style={uriBarStyle.backTouchArea}
                  onPress={() => {
                    if (onExitSelectionMode) {
                      onExitSelectionMode();
                    }
                  }}
                >
                  <Icon name="arrow-left" size={20} />
                </TouchableOpacity>
                {selectedItemCount > 0 && <Text style={uriBarStyle.itemCount}>{selectedItemCount}</Text>}
              </View>

              <View style={uriBarStyle.selectionModeActions}>
                {allowEdit && selectedItemCount === 1 && (
                  <TouchableOpacity
                    style={[uriBarStyle.actionTouchArea, uriBarStyle.leftAction]}
                    onPress={() => {
                      if (onEditActionPressed) {
                        onEditActionPressed();
                      }
                    }}
                  >
                    <Icon name="edit" size={20} style={uriBarStyle.actionIcon} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={uriBarStyle.actionTouchArea}
                  onPress={() => {
                    if (onDeleteActionPressed) {
                      onDeleteActionPressed();
                    }
                  }}
                >
                  <Icon name="trash-alt" solid={false} size={20} style={uriBarStyle.actionIcon} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!selectionMode && (
            <NavigationButton
              name="bars"
              size={24}
              style={uriBarStyle.drawerMenuButton}
              iconStyle={uriBarStyle.drawerHamburger}
              onPress={() => navigation.openDrawer()}
            />
          )}
          {!selectionMode && (
            <TextInput
              ref={ref => {
                this.textInput = ref;
              }}
              autoCorrect={false}
              style={uriBarStyle.uriText}
              selection={!this.state.focused ? { start: 0, end: 0 } : null}
              selectTextOnFocus
              placeholder={__('Search movies, music, and more')}
              underlineColorAndroid={'transparent'}
              numberOfLines={1}
              clearButtonMode={'while-editing'}
              value={this.state.currentValue}
              returnKeyType={'go'}
              inlineImageLeft={'baseline_search_black_24'}
              inlineImagePadding={16}
              onFocus={() => this.setState({ focused: true })}
              onBlur={() => this.setState({ focused: false })}
              onChangeText={this.handleChangeText}
              onSubmitEditing={this.handleSubmitEditing}
            />
          )}
        </View>
        {this.state.focused && showUriBarSuggestions && (
          <FlatList
            style={[
              uriBarStyle.suggestions,
              { height: Dimensions.get('window').height - this.state.keyboardHeight - 60 },
            ]}
            data={suggestions}
            keyboardShouldPersistTaps={'handled'}
            keyExtractor={(item, value) => `${item.value}-${item.type}`}
            renderItem={({ item }) => (
              <UriBarItem item={item} navigation={navigation} onPress={() => this.handleItemPress(item)} />
            )}
          />
        )}
      </View>
    );
  }
}

export default UriBar;
