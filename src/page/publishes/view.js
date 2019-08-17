import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import Button from 'component/button';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import FileListItem from 'component/fileListItem';
import FloatingWalletBalance from 'component/floatingWalletBalance';
import UriBar from 'component/uriBar';
import publishStyle from 'styles/publish';
import { __ } from 'utils/helper';

class PublishesPage extends React.PureComponent {
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

  componentDidMount() {
    this.onComponentFocused();
  }

  onComponentFocused = () => {
    const { checkPendingPublishes, fetchMyClaims, pushDrawerStack, setPlayerVisible } = this.props;

    pushDrawerStack();
    setPlayerVisible();
    fetchMyClaims();
    checkPendingPublishes();
  };

  render() {
    const { fetching, navigation, uris } = this.props;

    return (
      <View style={publishStyle.container}>
        <UriBar navigation={navigation} />
        {fetching && (
          <View style={publishStyle.centered}>
            <ActivityIndicator size={'small'} color={Colors.LbryGreen} />
          </View>
        )}

        {!fetching && (!uris || uris.length === 0) && (
          <View style={publishStyle.noPublishes}>
            <Text style={publishStyle.noPublishText}>
              {__('It looks like you have not published anything to LBRY yet.')}
            </Text>
            <Button
              style={publishStyle.publishNowButton}
              text={__('Publish something new')}
              onPress={() => navigation.navigate({ routeName: Constants.DRAWER_ROUTE_PUBLISH })}
            />
          </View>
        )}

        {uris && uris.length > 0 && (
          <FlatList
            style={publishStyle.publishesList}
            contentContainerStyle={publishStyle.publishesScrollPadding}
            initialNumToRender={8}
            maxToRenderPerBatch={24}
            removeClippedSubviews
            renderItem={({ item }) => (
              <FileListItem key={item} uri={item} style={publishStyle.listItem} navigation={navigation} />
            )}
            data={uris}
            keyExtractor={(item, index) => item}
          />
        )}

        <FloatingWalletBalance navigation={navigation} />
      </View>
    );
  }
}

export default PublishesPage;
