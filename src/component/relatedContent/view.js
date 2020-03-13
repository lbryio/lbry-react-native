import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import { navigateToUri } from 'utils/helper';
import Colors from 'styles/colors';
import FileListItem from 'component/fileListItem';
import ClaimResultItem from 'component/claimResultItem';
import fileListStyle from 'styles/fileList';
import relatedContentStyle from 'styles/relatedContent';

export default class RelatedContent extends React.PureComponent {
  componentDidMount() {
    const { title, claimId, searchRecommended, showNsfwContent } = this.props;
    if (title && claimId) {
      searchRecommended(title, claimId, showNsfwContent);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { isSearching, recommendedContent } = nextProps;
    return isSearching || (!isSearching && recommendedContent && recommendedContent.length > 0);
  }

  render() {
    const { isSearching, recommendedContent, navigation, urlOpenHandler, uri, fullUri } = this.props;

    return (
      <View style={relatedContentStyle.container}>
        <Text style={relatedContentStyle.title}>{__('Related Content')}</Text>
        {isSearching && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}
        {recommendedContent &&
          recommendedContent.map(result => (
            <ClaimResultItem
              style={fileListStyle.item}
              uri={result ? normalizeURI(`${result.name}#${result.claimId}`) : null}
              urlOpenHandler={urlOpenHandler}
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
