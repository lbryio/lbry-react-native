import React from 'react';
import { Text, FlatList, View } from 'react-native';
import { normalizeURI } from 'lbry-redux';
import ChannelIconItem from 'component/channelIconItem';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import subscriptionsStyle from 'styles/subscriptions';

export default class SubscribedChannelList extends React.PureComponent {
  render() {
    const { subscribedChannels, onChannelSelected } = this.props;

    return (
      <View style={subscriptionsStyle.channelList}>
        <FlatList
          contentContainerStyle={subscriptionsStyle.channelListScrollContainer}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          removeClippedSubviews
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <ChannelIconItem
              key={item}
              isPlaceholder={item.toLowerCase() === Constants.ALL_PLACEHOLDER}
              uri={normalizeURI(item)}
              onPress={() => onChannelSelected(item)}
            />
          )}
          data={subscribedChannels}
          keyExtractor={(item, index) => item}
        />
      </View>
    );
  }
}
