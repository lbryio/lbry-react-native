import React from 'react';
import { ActivityIndicator, NativeModules, FlatList, Text, View } from 'react-native';
import { DEFAULT_FOLLOWED_TAGS, normalizeURI } from 'lbry-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import ClaimList from 'component/claimList';
import FileItem from 'component/fileItem';
import discoverStyle from 'styles/discover';
import fileListStyle from 'styles/fileList';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FloatingWalletBalance from 'component/floatingWalletBalance';
import UriBar from 'component/uriBar';

class TrendingPage extends React.PureComponent {
  state = {
    followedTags: DEFAULT_FOLLOWED_TAGS,
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

  render() {
    const { navigation } = this.props;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} />
        <ClaimList
          style={discoverStyle.verticalClaimList}
          tags={this.state.followedTags}
          navigation={navigation}
          orientation={Constants.ORIENTATION_VERTICAL}
        />
        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}

export default TrendingPage;
