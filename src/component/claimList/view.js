import React from 'react';
import NavigationActions from 'react-navigation';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import FileItem from 'component/fileItem';
import FileListItem from 'component/fileListItem';
import Colors from 'styles/colors';
import Constants from 'constants';
import claimListStyle from 'styles/claimList';
import discoverStyle from 'styles/discover';

class ClaimList extends React.PureComponent {
  componentDidMount() {
    const { searchByTags, tags } = this.props;
    searchByTags(tags);
  }

  render() {
    const { loading, navigation, orientation = Constants.ORIENTATION_HORIZONTAL, uris } = this.props;

    if (loading) {
      return (
        <View style={discoverStyle.listLoading}>
          <ActivityIndicator size={"small"} color={Colors.LbryGreen} />
        </View>
      );
    }

    if (Constants.ORIENTATION_VERTICAL === orientation) {
      return (
        <FlatList
          style={claimListStyle.verticalScrollContainer}
          contentContainerStyle={discoverStyle.verticalScrollPadding}
          initialNumToRender={8}
          maxToRenderPerBatch={24}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <FileListItem
              key={this.state.currentUri}
              uri={this.state.currentUri}
              featuredResult={true}
              style={claimListStyle.verticalListItem}
              navigation={navigation} />
          )}
          data={uris}
          keyExtractor={(item, index) => item}
          />
      );
    }

    if (Constants.ORIENTATION_HORIZONTAL === orientation) {
      return (
        <FlatList
          style={discoverStyle.horizontalScrollContainer}
          contentContainerStyle={discoverStyle.horizontalScrollPadding}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <FileItem
              style={discoverStyle.fileItem}
              mediaStyle={discoverStyle.fileItemMedia}
              key={item}
              uri={normalizeURI(item)}
              navigation={navigation}
              showDetails={true}
              compactView={false}
            />
          )}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={uris}
          keyExtractor={(item, index) => item}
        />
      );
    }

    return null;
  }
}

export default ClaimList;
