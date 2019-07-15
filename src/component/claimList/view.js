import React from 'react';
import NavigationActions from 'react-navigation';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import FileItem from '/component/fileItem';
import Colors from 'styles/colors';
import discoverStyle from 'styles/discover';

class ClaimList extends React.PureComponent {
  componentDidMount() {
    const { searchByTags, tags } = this.props;
    searchByTags(tags);
  }

  render() {
    const { loading, navigation, uris } = this.props;

    if (loading) {
      return (
        <View style={discoverStyle.listLoading}>
          <ActivityIndicator size={"small"} color={Colors.LbryGreen} />
        </View>
      );
    }

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
}

export default ClaimList;
