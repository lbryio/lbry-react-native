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
import Constants from 'constants';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import ModalPicker from 'component/modalPicker';
import UriBar from 'component/uriBar';

const sortByItems = [
  { icon: 'fire-alt', name: 'hot', label: 'Hot content' },
  { icon: 'certificate', name: 'new', label: 'New content' },
  { icon: 'chart-line', name: 'top', label: 'Top content' }
];

class TagPage extends React.PureComponent {
  state = {
    tag: null,
    showSortPicker: false,
    orderBy: ['trending_global', 'trending_mixed'],
    currentSortByItem: sortByItems[0],
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
  
  handleSortByItemSelected = (item) => {
    let orderBy = [];
    switch (item.name) {
      case 'hot':
        orderBy = ['trending_global', 'trending_mixed'];
        break;
      
      case 'new':
        orderBy = ['release_time'];
        break;
      
      case 'top':
        orderBy = ['effective_amount'];
        break;
    }
    
    this.setState({ currentSortByItem: item, orderBy, showSortPicker: false });
  }

  render() {
    const { navigation } = this.props;
    const { tag, currentSortByItem } = this.state;
    
    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} belowOverlay={this.state.showSortPicker} />
        <View style={discoverStyle.tagTitleRow}>
          <Text style={discoverStyle.tagPageTitle}>{formatTagTitle(tag)}</Text>
          <TouchableOpacity style={discoverStyle.tagSortBy} onPress={() => this.setState({ showSortPicker: true })}>
            <Text style={discoverStyle.tagSortText}>{currentSortByItem.label.split(' ')[0]}</Text>
            <Icon style={discoverStyle.tagSortIcon} name={"sort-down"} size={14} />
          </TouchableOpacity>
        </View>
        <ClaimList
          style={discoverStyle.tagPageClaimList}
          orderBy={this.state.orderBy}
          tags={[tag]}
          navigation={navigation}
          orientation={Constants.ORIENTATION_VERTICAL} />
        {!this.state.showSortPicker && <FloatingWalletBalance navigation={navigation} />}
        {this.state.showSortPicker && <ModalPicker
          title={'Sort content by'}
          onOverlayPress={() => this.setState({ showSortPicker: false })}
          onItemSelected={this.handleSortByItemSelected}
          selectedItem={this.state.currentSortByItem}
          items={sortByItems} />}
      </View>
    );
  }
}

export default TagPage;
