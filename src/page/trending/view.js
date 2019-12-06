import React from 'react';
import { ActivityIndicator, NativeModules, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import { getOrderBy } from 'utils/helper';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import ClaimList from 'component/claimList';
import FileItem from 'component/fileItem';
import Link from 'component/link';
import ModalPicker from 'component/modalPicker';
import ModalTagSelector from 'component/modalTagSelector';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FloatingWalletBalance from 'component/floatingWalletBalance';
import Icon from 'react-native-vector-icons/FontAwesome5';
import UriBar from 'component/uriBar';
import discoverStyle from 'styles/discover';

const TRENDING_FOR_ITEMS = [
  { icon: 'globe-americas', name: 'everyone', label: 'Everyone' },
  { icon: 'hashtag', name: 'tags', label: 'Tags you follow' },
];

class TrendingPage extends React.PureComponent {
  state = {
    showModalTagSelector: false,
    showSortByPicker: false,
    showTimePicker: false,
    showTrendingForPicker: false,
    orderBy: Constants.DEFAULT_ORDER_BY,
    currentTrendingForItem: TRENDING_FOR_ITEMS[0],
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
    const { pushDrawerStack, setPlayerVisible, navigation, sortByItem } = this.props;
    const { filterForTags } = navigation.state.params ? navigation.state.params : { filterForTags: false };
    this.setState({
      currentTrendingForItem: TRENDING_FOR_ITEMS[filterForTags ? 1 : 0],
      orderBy: getOrderBy(sortByItem),
    });
    pushDrawerStack(Constants.DRAWER_ROUTE_TRENDING, navigation.state.params);
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('All content');
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_TRENDING === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  handleTrendingForItemSelected = item => {
    this.setState({ currentTrendingForItem: item, showTrendingForPicker: false });
  };

  handleSortByItemSelected = item => {
    const { setSortByItem } = this.props;
    setSortByItem(item);
    this.setState({ orderBy: getOrderBy(item), showSortPicker: false });
  };

  handleTimeItemSelected = item => {
    const { setTimeItem } = this.props;
    setTimeItem(item);
    this.setState({ showTimePicker: false });
  };

  listHeader = () => {
    const { sortByItem, timeItem } = this.props;
    const { currentTrendingForItem } = this.state;
    const sortByTop = Constants.SORT_BY_TOP === sortByItem.name;

    return (
      <View style={discoverStyle.listHeader}>
        <View style={discoverStyle.titleRow}>
          <Text style={discoverStyle.pageTitle}>{__('All Content')}</Text>
        </View>
        <View style={discoverStyle.pickerRow}>
          <View style={discoverStyle.leftPickerRow}>
            <TouchableOpacity
              style={discoverStyle.allTagSortBy}
              onPress={() => this.setState({ showSortPicker: true })}
            >
              <Text style={discoverStyle.tagSortText}>{__(sortByItem.label.split(' ')[0])}</Text>
              <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
            </TouchableOpacity>

            <Text style={discoverStyle.pickerLabel}>{__('for')}</Text>
            <TouchableOpacity
              style={discoverStyle.allTagSortBy}
              onPress={() => this.setState({ showTrendingForPicker: true })}
            >
              <Text style={discoverStyle.tagSortText}>{__(currentTrendingForItem.label.split(' ')[0])}</Text>
              <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
            </TouchableOpacity>

            {sortByTop && <Text style={discoverStyle.pickerLabel}>{__('from')}</Text>}

            {sortByTop && (
              <TouchableOpacity style={discoverStyle.tagTime} onPress={() => this.setState({ showTimePicker: true })}>
                <Text style={discoverStyle.tagSortText}>{__(timeItem.label)}</Text>
                <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
              </TouchableOpacity>
            )}
          </View>

          {TRENDING_FOR_ITEMS[1].name === currentTrendingForItem.name && (
            <Link
              style={discoverStyle.customizeLink}
              text={__('Customize')}
              onPress={() => this.setState({ showModalTagSelector: true })}
            />
          )}
        </View>
      </View>
    );
  };

  render() {
    const { followedTags, navigation, sortByItem, timeItem } = this.props;
    const {
      currentTrendingForItem,
      orderBy,
      showModalTagSelector,
      showSortPicker,
      showTimePicker,
      showTrendingForPicker,
    } = this.state;
    const filteredForTags = TRENDING_FOR_ITEMS[1].name === currentTrendingForItem.name;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} />
        <ClaimList
          ListHeaderComponent={this.listHeader}
          style={discoverStyle.verticalClaimList}
          orderBy={orderBy}
          tags={filteredForTags ? followedTags.map(tag => tag.name) : null}
          time={timeItem.name}
          navigation={navigation}
          orientation={Constants.ORIENTATION_VERTICAL}
        />
        {!showModalTagSelector && !showTrendingForPicker && !showSortPicker && !showTimePicker && (
          <FloatingWalletBalance navigation={navigation} />
        )}
        {showModalTagSelector && (
          <ModalTagSelector
            onOverlayPress={() => this.setState({ showModalTagSelector: false })}
            onDonePress={() => this.setState({ showModalTagSelector: false })}
          />
        )}
        {showTrendingForPicker && (
          <ModalPicker
            title={__('Filter for')}
            onOverlayPress={() => this.setState({ showTrendingForPicker: false })}
            onItemSelected={this.handleTrendingForItemSelected}
            selectedItem={currentTrendingForItem}
            items={TRENDING_FOR_ITEMS}
          />
        )}
        {showSortPicker && (
          <ModalPicker
            title={__('Sort content by')}
            onOverlayPress={() => this.setState({ showSortPicker: false })}
            onItemSelected={this.handleSortByItemSelected}
            selectedItem={sortByItem}
            items={Constants.CLAIM_SEARCH_SORT_BY_ITEMS}
          />
        )}
        {showTimePicker && (
          <ModalPicker
            title={__('Content from')}
            onOverlayPress={() => this.setState({ showTimePicker: false })}
            onItemSelected={this.handleTimeItemSelected}
            selectedItem={timeItem}
            items={Constants.CLAIM_SEARCH_TIME_ITEMS}
          />
        )}
      </View>
    );
  }
}

export default TrendingPage;
