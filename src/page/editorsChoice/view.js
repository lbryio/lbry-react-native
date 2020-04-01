import React from 'react';
import { ActivityIndicator, NativeModules, FlatList, Text, TouchableOpacity, ScrollView, View } from 'react-native';
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
import SdkLoadingStatus from 'component/sdkLoadingStatus';
import UriBar from 'component/uriBar';
import editorsChoiceStyle from 'styles/editorsChoice';

class EditorsChoicePage extends React.PureComponent {
  onComponentFocused = () => {
    const { pushDrawerStack, setPlayerVisible } = this.props;
    pushDrawerStack();
    setPlayerVisible();
    NativeModules.Firebase.setCurrentScreen('EditorsChoice');
  };

  componentDidMount() {
    this.onComponentFocused();
  }

  componentWillReceiveProps(nextProps) {
    const { currentRoute } = nextProps;
    const { currentRoute: prevRoute } = this.props;
    if (Constants.DRAWER_ROUTE_EDITORS_CHOICE === currentRoute && currentRoute !== prevRoute) {
      this.onComponentFocused();
    }
  }

  render() {
    const { navigation } = this.props;

    return (
      <View style={editorsChoiceStyle.container}>
        <UriBar navigation={navigation} />

        <ScrollView style={editorsChoiceStyle.categories} contentContainerStyle={editorsChoiceStyle.categoriesContent}>
          <Text style={editorsChoiceStyle.category}>{__('Short Films')}</Text>
          <ClaimList
            style={editorsChoiceStyle.claimList}
            channelIds={['7056f8267188fc49cd3f7162b4115d9e3c8216f6']}
            editorsChoice
            navigation={navigation}
            orientation={Constants.ORIENTATION_VERTICAL}
          />

          <Text style={editorsChoiceStyle.category}>{__('Feature-Length Films')}</Text>
          <ClaimList
            style={editorsChoiceStyle.claimList}
            channelIds={['7aad6f36f61da95cb02471fae55f736b28e3bca7']}
            editorsChoice
            navigation={navigation}
            orientation={Constants.ORIENTATION_VERTICAL}
          />

          <Text style={editorsChoiceStyle.category}>{__('Documentaries')}</Text>
          <ClaimList
            style={editorsChoiceStyle.claimList}
            channelIds={['d57c606e11462e821d5596430c336b58716193bb']}
            editorsChoice
            navigation={navigation}
            orientation={Constants.ORIENTATION_VERTICAL}
          />

          <Text style={editorsChoiceStyle.category}>{__('Episodic Content')}</Text>
          <ClaimList
            style={editorsChoiceStyle.claimList}
            channelIds={['ea5fc1bd3e1335776fe2641a539a47850606d7db']}
            editorsChoice
            navigation={navigation}
            orientation={Constants.ORIENTATION_VERTICAL}
          />
        </ScrollView>
      </View>
    );
  }
}

export default EditorsChoicePage;
