import React from 'react';
import { ActivityIndicator, NativeModules, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_FOLLOWED_TAGS, normalizeURI } from 'lbry-redux';
import { formatTagTitle } from 'utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import ClaimList from 'component/claimList';
import FileItem from 'component/fileItem';
import Icon from 'react-native-vector-icons/FontAwesome5';
import discoverStyle from 'styles/discover';
import fileListStyle from 'styles/fileList';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FloatingWalletBalance from 'component/floatingWalletBalance';
import ModalPicker from 'component/modalPicker';
import UriBar from 'component/uriBar';

class TagPage extends React.PureComponent {
  state = {
    tag: null,
    showSortPicker: false,
    showTimePicker: false,
    orderBy: Constants.DEFAULT_ORDER_BY,
    time: Constants.TIME_WEEK,
    currentSortByItem: Constants.CLAIM_SEARCH_SORT_BY_ITEMS[0],
    currentTimeItem: Constants.CLAIM_SEARCH_TIME_ITEMS[1],
  };

  didFocusListener;

  componentWillMount() {
    const { navigation } = this.props;
    this.didFocusListener = navigation.addListener('didFocus', this.onComponentFocused);
  }

  componentWillUnmount() {
    if (this.didFocusListener) {
      this.didFocusListener.remove();
    }
  }

  onComponentFocused = () => {
    const { pushDrawerStack, setPlayerVisible, navigation } = this.props;
    this.setState({ tag: navigation.state.params.tag });
    pushDrawerStack();
    setPlayerVisible();
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute, navigation } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_TAG === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  handleSortByItemSelected = item => {
    let orderBy = [];
    switch (item.name) {
      case Constants.SORT_BY_HOT:
        orderBy = Constants.DEFAULT_ORDER_BY;
        break;

      case Constants.SORT_BY_NEW:
        orderBy = ['release_time'];
        break;

      case Constants.SORT_BY_TOP:
        orderBy = [Constants.ORDER_BY_EFFECTIVE_AMOUNT];
        break;
    }

    this.setState({ currentSortByItem: item, orderBy, showSortPicker: false });
  };

  handleTimeItemSelected = item => {
    this.setState({ time: item.name });
  };

  render() {
    const { navigation } = this.props;
    const { tag, currentSortByItem, currentTimeItem, showSortPicker, showTimePicker } = this.state;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} belowOverlay={showSortPicker || showTimePicker} />
        <ClaimList
          ListHeaderComponent={
            <View style={discoverStyle.tagTitleRow}>
              <Text style={discoverStyle.tagPageTitle}>{formatTagTitle(tag)}</Text>
              {Constants.SORT_BY_TOP === currentSortByItem.name && (
                <TouchableOpacity style={discoverStyle.tagTime} onPress={() => this.setState({ showTimePicker: true })}>
                  <Text style={discoverStyle.tagSortText}>{currentTimeItem.label}</Text>
                  <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={discoverStyle.tagSortBy} onPress={() => this.setState({ showSortPicker: true })}>
                <Text style={discoverStyle.tagSortText}>{currentSortByItem.label.split(' ')[0]}</Text>
                <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
              </TouchableOpacity>
            </View>
          }
          style={discoverStyle.tagPageClaimList}
          orderBy={this.state.orderBy}
          time={this.state.time}
          tags={[tag]}
          navigation={navigation}
          orientation={Constants.ORIENTATION_VERTICAL}
        />
        {!showSortPicker && !showTimePicker && <FloatingWalletBalance navigation={navigation} />}
        {showSortPicker && (
          <ModalPicker
            title={__('Sort content by')}
            onOverlayPress={() => this.setState({ showSortPicker: false })}
            onItemSelected={this.handleSortByItemSelected}
            selectedItem={this.state.currentSortByItem}
            items={Constants.CLAIM_SEARCH_SORT_BY_ITEMS}
          />
        )}
        {showTimePicker && (
          <ModalPicker
            title={__('Content from')}
            onOverlayPress={() => this.setState({ showTimePicker: false })}
            onItemSelected={this.handleTimeItemSelected}
            selectedItem={this.state.currentTimeItem}
            items={Constants.CLAIM_SEARCH_TIME_ITEMS}
          />
        )}
      </View>
    );
  }
}

export default TagPage;
