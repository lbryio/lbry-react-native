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
    urlsResolved: false,
  };

  componentDidUpdate(prevProps) {
    const { resolveUris, recommendedContent } = this.props;

    if (recommendedContent && recommendedContent.length > 0 && !this.state.urisResolved) {
      this.setState({ urisResolved: true }, () => {
        // batch resolve the uris
        resolveUris(recommendedContent);
      });
    }
  }

  render() {
    const { recommendedContent, navigation, uri, fullUri } = this.props;

    return (
      <View style={relatedContentStyle.container}>
        <Text style={relatedContentStyle.title}>Related Content</Text>
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
