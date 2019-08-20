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
import Link from 'component/link';
import ModalPicker from 'component/modalPicker';
import UriBar from 'component/uriBar';

class TagPage extends React.PureComponent {
  state = {
    tag: null,
    showSortPicker: false,
    showTimePicker: false,
    orderBy: Constants.DEFAULT_ORDER_BY,
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
    this.setState({ tag, orderBy: getOrderBy(sortByItem) });
    pushDrawerStack(Constants.DRAWER_ROUTE_TAG, navigation.state.params);
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('Tag');
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
    const { setTimeItem } = this.props;
    setTimeItem(item);
    this.setState({ showTimePicker: false });
  };

  isFollowingTag = tag => {
    const { followedTags } = this.props;
    return followedTags.map(tag => tag.name).includes(tag);
  };

  handleFollowTagToggle = () => {
    const { toggleTagFollow } = this.props;
    const { tag } = this.state;
    const isFollowing = this.isFollowingTag(tag);
    if (isFollowing) {
      // unfollow
      NativeModules.Firebase.track('tag_unfollow', { tag });
    } else {
      // follow
      NativeModules.Firebase.track('tag_follow', { tag });
    }

    toggleTagFollow(tag);
    if (window.persistor) {
      window.persistor.flush();
    }
  };

  listHeader = () => {
    const { sortByItem, timeItem } = this.props;
    const { tag } = this.state;

    return (
      <View style={discoverStyle.listHeader}>
        <View style={discoverStyle.titleRow}>
          <Text style={discoverStyle.pageTitle}>{formatTagTitle(tag)}</Text>
        </View>
        <View style={discoverStyle.pickerRow}>
          <View style={discoverStyle.leftPickerRow}>
            <TouchableOpacity style={discoverStyle.tagSortBy} onPress={() => this.setState({ showSortPicker: true })}>
              <Text style={discoverStyle.tagSortText}>{sortByItem.label.split(' ')[0]}</Text>
              <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
            </TouchableOpacity>
            {Constants.SORT_BY_TOP === sortByItem.name && (
              <TouchableOpacity style={discoverStyle.tagTime} onPress={() => this.setState({ showTimePicker: true })}>
                <Text style={discoverStyle.tagSortText}>{timeItem.label}</Text>
                <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
              </TouchableOpacity>
            )}
          </View>

          <Link
            style={discoverStyle.customizeLink}
            text={this.isFollowingTag(tag) ? 'Unfollow' : 'Follow'}
            onPress={this.handleFollowTagToggle}
          />
        </View>
      </View>
    );
  };

  render() {
    const { navigation, sortByItem, timeItem } = this.props;
    const { tag, showSortPicker, showTimePicker } = this.state;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} belowOverlay={showSortPicker || showTimePicker} />
        {this.state.tag && (
          <ClaimList
            ListHeaderComponent={this.listHeader}
            style={discoverStyle.tagPageClaimList}
            orderBy={this.state.orderBy}
            time={timeItem.name}
            tags={[tag]}
            navigation={navigation}
            orientation={Constants.ORIENTATION_VERTICAL}
          />
        )}
        {!showSortPicker && !showTimePicker && <FloatingWalletBalance navigation={navigation} />}
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

export default TagPage;
