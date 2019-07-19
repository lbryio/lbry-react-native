import React from 'react';
import NavigationActions from 'react-navigation';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import _ from 'lodash';
import FileItem from 'component/fileItem';
import FileListItem from 'component/fileListItem';
import Colors from 'styles/colors';
import Constants from 'constants';
import claimListStyle from 'styles/claimList';
import discoverStyle from 'styles/discover';

const softLimit = 500;

class ClaimList extends React.PureComponent {
  scrollView = null;
  
  state = {
    currentPage: 1 // initial page load is page 1
  };
  
  componentDidMount() {
    const { orderBy = ['trending_global', 'trending_mixed'], searchByTags, tags } = this.props;
    searchByTags(tags, orderBy, this.state.currentPgae);
  }
  
  componentWillReceiveProps(nextProps) {
    const { orderBy: prevOrderBy, searchByTags, tags: prevTags } = this.props;
    const { orderBy, tags } = nextProps;
    if (!_.isEqual(orderBy, prevOrderBy) || !_.isEqual(tags, prevTags)) {
      // reset to page 1 because the order or tags changed
      this.setState({ currentPage: 1 }, () => {
        if (this.scrollView) {
          this.scrollView.scrollToOffset({ animated: true, offset: 0 });
        }
        searchByTags(tags, orderBy, this.state.currentPage)
      });
    }
  }
  
  handleVerticalEndReached = () => {
    // fetch more content
    const { orderBy, searchByTags, tags, uris } = this.props;
    if (uris && uris.length >= softLimit) {
      // don't fetch more than the specified limit to be displayed
      return;
    }
    
    this.setState({ currentPage: this.state.currentPage + 1 }, () => searchByTags(tags, orderBy, this.state.currentPage));
  }

  render() {
    const { loading, navigation, orientation = Constants.ORIENTATION_VERTICAL, style, uris } = this.props;
    
    if (Constants.ORIENTATION_VERTICAL === orientation) {
      return (
        <View style={style}>
          <FlatList
            ref={ref => { this.scrollView = ref; }}
            style={claimListStyle.verticalScrollContainer}
            contentContainerStyle={claimListStyle.verticalScrollPadding}
            initialNumToRender={8}
            maxToRenderPerBatch={24}
            removeClippedSubviews={true}
            renderItem={({ item }) => (
              <FileListItem
                key={item}
                uri={item}
                style={claimListStyle.verticalListItem}
                navigation={navigation} />
            )}
            data={uris}
            keyExtractor={(item, index) => item}
            onEndReached={this.handleVerticalEndReached}
            onEndReachedThreshold={0.9}
            />
          {loading && <View style={claimListStyle.verticalLoading}>
            <ActivityIndicator size={"small"} color={Colors.LbryGreen} />
          </View>}
        </View>
      );
    }

    if (Constants.ORIENTATION_HORIZONTAL === orientation) {
      if (loading) {
        return (
          <View style={discoverStyle.listLoading}>
            <ActivityIndicator size={"small"} color={Colors.LbryGreen} />
          </View>
        );
      }
      
      return (
        <FlatList
          style={style || claimListStyle.horizontalScrollContainer}
          contentContainerStyle={claimListStyle.horizontalScrollPadding}
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
