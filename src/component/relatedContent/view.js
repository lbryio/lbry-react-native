import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import { navigateToUri } from 'utils/helper';
import Colors from 'styles/colors';
import FileListItem from 'component/fileListItem';
import FileResultItem from 'component/fileResultItem';
import fileListStyle from 'styles/fileList';
import relatedContentStyle from 'styles/relatedContent';

export default class RelatedContent extends React.PureComponent {
  componentDidMount() {
    const { title, claimId, searchRecommended } = this.props;
    if (title && claimId) {
      searchRecommended(title, claimId);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { isSearching, recommendedContent } = nextProps;
    return isSearching || (!isSearching && recommendedContent && recommendedContent.length > 0);
  }

  render() {
    const { isSearching, recommendedContent, navigation, uri, fullUri } = this.props;

    return (
      <View style={relatedContentStyle.container}>
        <Text style={relatedContentStyle.title}>{__('Related Content')}</Text>
        {isSearching && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}
        {recommendedContent &&
          recommendedContent.map(result => (
            <FileResultItem
              style={fileListStyle.item}
              key={result.claimId}
              result={result}
              navigation={navigation}
              autoplay
            />
          ))}
      </View>
    );
  }
}
