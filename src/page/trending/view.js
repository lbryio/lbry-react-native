import React from 'react';
import { ActivityIndicator, NativeModules, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { DEFAULT_FOLLOWED_TAGS, normalizeURI } from 'lbry-redux';
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
    showTrendingForPicker: false,
    currentTrendingForItem: TRENDING_FOR_ITEMS[0],
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
    const { pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.FULL_ROUTE_NAME_TRENDING === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  handleTrendingForItemSelected = item => {
    this.setState({ currentTrendingForItem: item, showTrendingForPicker: false });
  };

  render() {
    const { followedTags, navigation } = this.props;
    const { currentTrendingForItem, showModalTagSelector, showTrendingForPicker } = this.state;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} />
        <ClaimList
          ListHeaderComponent={
            <View style={discoverStyle.titleRow}>
              <Text style={discoverStyle.pageTitle}>Trending</Text>
              <View style={discoverStyle.rightTitleRow}>
                {TRENDING_FOR_ITEMS[1].name === currentTrendingForItem.name && (
                  <Link
                    style={discoverStyle.customizeLink}
                    text={'Customize'}
                    onPress={() => this.setState({ showModalTagSelector: true })}
                  />
                )}
                <TouchableOpacity
                  style={discoverStyle.tagSortBy}
                  onPress={() => this.setState({ showTrendingForPicker: true })}
                >
                  <Text style={discoverStyle.tagSortText}>{currentTrendingForItem.label.split(' ')[0]}</Text>
                  <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
                </TouchableOpacity>
              </View>
            </View>
          }
          style={discoverStyle.verticalClaimList}
          orderBy={Constants.DEFAULT_ORDER_BY}
          trendingForAll={TRENDING_FOR_ITEMS[0].name === currentTrendingForItem.name}
          tags={followedTags.map(tag => tag.name)}
          time={null}
          navigation={navigation}
          orientation={Constants.ORIENTATION_VERTICAL}
        />
        {!showModalTagSelector && <FloatingWalletBalance navigation={navigation} />}
        {showModalTagSelector && (
          <ModalTagSelector
            onOverlayPress={() => this.setState({ showModalTagSelector: false })}
            onDonePress={() => this.setState({ showModalTagSelector: false })}
          />
        )}
        {showTrendingForPicker && (
          <ModalPicker
            title={'Trending for'}
            onOverlayPress={() => this.setState({ showTrendingForPicker: false })}
            onItemSelected={this.handleTrendingForItemSelected}
            selectedItem={currentTrendingForItem}
            items={TRENDING_FOR_ITEMS}
          />
        )}
      </View>
    );
  }
}

export default TrendingPage;
