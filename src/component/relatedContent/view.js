import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import { navigateToUri } from 'utils/helper';
import Colors from 'styles/colors';
import FileListItem from 'component/fileListItem';
import fileListStyle from 'styles/fileList';
import relatedContentStyle from 'styles/relatedContent';

export default class RelatedContent extends React.PureComponent {
  state = {
    resolveStarted: false,
  };

  componentDidMount() {
    const { title, searchRecommended } = this.props;
    if (title) {
      searchRecommended(title);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { isSearching, recommendedContent } = nextProps;
    return isSearching || (!isSearching && this.allContentResolved());
  }

  allContentResolved() {
    const { recommendedContent, resolvingUris } = this.props;
    if (recommendedContent) {
      let allResolved = true;
      recommendedContent.forEach(uri => {
        allResolved = allResolved && !resolvingUris.includes(uri);
      });
      return allResolved;
    }

    return false;
  }

  componentDidUpdate() {
    const { resolveUris, recommendedContent } = this.props;
    if (!this.state.resolveStarted) {
      this.setState({ resolveStarted: true }, () => {
        if (recommendedContent && recommendedContent.length > 0) {
          // batch resolve the uris
          resolveUris(recommendedContent);
        }
      });
    }
  }

  render() {
    const { isSearching, recommendedContent, navigation, uri, fullUri } = this.props;

    return (
      <View style={relatedContentStyle.container}>
        <Text style={relatedContentStyle.title}>{__('Related Content')}</Text>
        {isSearching && <ActivityIndicator size={'small'} color={Colors.NextLbryGreen} />}
        {recommendedContent &&
          recommendedContent
            .filter(recommendedUri => recommendedUri !== normalizeURI(fullUri))
            .map(recommendedUri => (
              <FileListItem
                style={fileListStyle.item}
                key={recommendedUri}
                uri={recommendedUri}
                batchResolve
                navigation={navigation}
                autoplay
              />
            ))}
      </View>
    );
  }
}
