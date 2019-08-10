import React from 'react';
import { ActivityIndicator, NativeModules, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_FOLLOWED_TAGS, normalizeURI } from 'lbry-redux';
import { formatTagTitle, getOrderBy } from 'utils/helper';
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
    currentTimeItem: Constants.CLAIM_SEARCH_TIME_ITEMS[1],
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
    const { navigation, pushDrawerStack, setPlayerVisible, sortByItem } = this.props;
    const { tag } = navigation.state.params;
    this.setState({ tag, sortByItem, orderBy: getOrderBy(sortByItem) });
    pushDrawerStack(Constants.DRAWER_ROUTE_TAG, navigation.state.params);
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
    const { setSortByItem } = this.props;
    setSortByItem(item);
    this.setState({ orderBy: getOrderBy(item), showSortPicker: false });
  };

  handleTimeItemSelected = item => {
    this.setState({ currentTimeItem: item, time: item.name, showTimePicker: false });
  };

  render() {
    const { navigation, sortByItem } = this.props;
    const { tag, currentTimeItem, showSortPicker, showTimePicker } = this.state;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} belowOverlay={showSortPicker || showTimePicker} />
        <ClaimList
          ListHeaderComponent={
            <View style={discoverStyle.tagTitleRow}>
              <Text style={discoverStyle.tagPageTitle}>{formatTagTitle(tag)}</Text>
              {Constants.SORT_BY_TOP === sortByItem.name && (
                <TouchableOpacity style={discoverStyle.tagTime} onPress={() => this.setState({ showTimePicker: true })}>
                  <Text style={discoverStyle.tagSortText}>{currentTimeItem.label}</Text>
                  <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={discoverStyle.tagSortBy} onPress={() => this.setState({ showSortPicker: true })}>
                <Text style={discoverStyle.tagSortText}>{sortByItem.label.split(' ')[0]}</Text>
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
            selectedItem={this.state.sortByItem}
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
