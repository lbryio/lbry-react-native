import React from 'react';
import { ActivityIndicator, NativeModules, FlatList, Text, View } from 'react-native';
import { DEFAULT_FOLLOWED_TAGS, normalizeURI } from 'lbry-redux';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import ClaimList from 'component/claimList';
import FileItem from 'component/fileItem';
import Link from 'component/link';
import ModalTagSelector from 'component/modalTagSelector';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FloatingWalletBalance from 'component/floatingWalletBalance';
import UriBar from 'component/uriBar';
import discoverStyle from 'styles/discover';

class TrendingPage extends React.PureComponent {
  state = {
    showModalTagSelector: false,
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
    const { followedTags, navigation } = this.props;
    const { showModalTagSelector } = this.state;

    return (
      <View style={discoverStyle.container}>
        <UriBar navigation={navigation} />
        <View style={discoverStyle.titleRow}>
          <Text style={discoverStyle.pageTitle}>Trending</Text>
          <Link
            style={discoverStyle.customizeLink}
            text={'Customize this page'}
            onPress={() => this.setState({ showModalTagSelector: true })}
          />
        </View>
        <ClaimList
          style={discoverStyle.verticalClaimList}
          tags={followedTags.map(tag => tag.name)}
          navigation={navigation}
          orientation={Constants.ORIENTATION_VERTICAL}
        />
        {!showModalTagSelector && <FloatingWalletBalance navigation={navigation} />}
        {showModalTagSelector && (
          <ModalTagSelector
            pageName={'Trending'}
            onOverlayPress={() => this.setState({ showModalTagSelector: false })}
            onDonePress={() => this.setState({ showModalTagSelector: false })}
          />
        )}
      </View>
    );
  }
}

export default TrendingPage;
