// @flow
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  NativeModules,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { normalizeURI } from 'lbry-redux';
import { navigateBack, getOrderBy } from 'utils/helper';
import ChannelIconItem from 'component/channelIconItem';
import ClaimList from 'component/claimList';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Button from 'component/button';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import ModalPicker from 'component/modalPicker';
import PageHeader from 'component/pageHeader';
import SubscribeButton from 'component/subscribeButton';
import SubscribeNotificationButton from 'component/subscribeNotificationButton';
import UriBar from 'component/uriBar';
import channelIconStyle from 'styles/channelIcon';
import channelPageStyle from 'styles/channelPage';
import discoverStyle from 'styles/discover';

class ChannelPage extends React.PureComponent {
  state = {
    autoStyle: null,
    showSortPicker: false,
    showTimePicker: false,
    orderBy: Constants.DEFAULT_ORDER_BY,
    activeTab: Constants.CONTENT_TAB,
  };

  componentWillMount() {
    this.setState({
      autoStyle:
        ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)],
    });
  }

  componentDidMount() {
    NativeModules.Firebase.setCurrentScreen('Channel');
  }

  handleSortByItemSelected = item => {
    const { setSortByItem } = this.props;
    setSortByItem(item);
    this.setState({ orderBy: getOrderBy(item), showSortPicker: false });
  };

  handleTimeItemSelected = item => {
    const { setTimeItem } = this.props;
    setTimeItem(item);
    this.setState({ showTimePicker: false });
  };

  listHeader = () => {
    const { sortByItem, timeItem } = this.props;

    return (
      <View style={channelPageStyle.listHeader}>
        <View style={discoverStyle.pickerRow}>
          <View style={discoverStyle.leftPickerRow}>
            <TouchableOpacity style={discoverStyle.tagSortBy} onPress={() => this.setState({ showSortPicker: true })}>
              <Text style={discoverStyle.tagSortText}>{sortByItem.label.split(' ')[0]}</Text>
              <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
            </TouchableOpacity>
            {Constants.SORT_BY_TOP === sortByItem.name && (
              <TouchableOpacity style={discoverStyle.tagTime} onPress={() => this.setState({ showTimePicker: true })}>
                <Text style={discoverStyle.tagSortText}>{timeItem.label}</Text>
                <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  renderContent = () => {
    const { claim, navigation, timeItem } = this.props;

    let channelId;
    if (claim) {
      channelId = claim.claim_id;
    }

    return (
      <View style={channelPageStyle.contentTab}>
        {channelId && (
          <ClaimList
            ListHeaderComponent={this.listHeader}
            hideChannel
            orderBy={this.state.orderBy}
            time={timeItem.name}
            navigation={navigation}
            orientation={Constants.ORIENTATION_VERTICAL}
            channelIds={[channelId]}
            style={channelPageStyle.claimList}
          />
        )}
      </View>
    );
  };

  renderAbout = () => {
    const { claim } = this.props;

    if (!claim) {
      return (
        <View style={channelPageStyle.aboutTab}>
          <View style={channelPageStyle.busyContainer}>
            <Text style={channelPageStyle.infoText}>No information to display.</Text>
          </View>
        </View>
      );
    }

    const { cover, description, thumbnail, email, website_url: websiteUrl, title } = claim.value;
    return (
      <View style={channelPageStyle.aboutTab}>
        {!websiteUrl && !email && !description && (
          <View style={channelPageStyle.busyContainer}>
            <Text style={channelPageStyle.infoText}>Nothing here yet. Please check back later.</Text>
          </View>
        )}

        {(websiteUrl || email || description) && (
          <ScrollView style={channelPageStyle.aboutScroll} contentContainerStyle={channelPageStyle.aboutScrollContent}>
            {websiteUrl && websiteUrl.trim().length > 0 && (
              <View style={channelPageStyle.aboutItem}>
                <Text style={channelPageStyle.aboutTitle}>Website</Text>
                <Link style={channelPageStyle.aboutText} text={websiteUrl} href={websiteUrl} />
              </View>
            )}

            {email && email.trim().length > 0 && (
              <View style={channelPageStyle.aboutItem}>
                <Text style={channelPageStyle.aboutTitle}>Email</Text>
                <Link style={channelPageStyle.aboutText} text={email} href={`mailto:${email}`} />
              </View>
            )}

            {description && description.trim().length > 0 && (
              <View style={channelPageStyle.aboutItem}>
                <Text style={channelPageStyle.aboutText}>{description}</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  onEditPressed = () => {
    const { claim, navigation } = this.props;
    if (claim) {
      const { permanent_url: permanentUrl } = claim;
      navigation.navigate({
        routeName: Constants.DRAWER_ROUTE_CHANNEL_CREATOR,
        params: { editChannelUrl: permanentUrl },
      });
    }
  };

  onDeletePressed = () => {
    const { abandonClaim, claim, navigation } = this.props;
    if (claim) {
      const { txid, nout } = claim;

      // show confirm alert
      Alert.alert(
        __('Delete channel'),
        __('Are you sure you want to delete this channel?'),
        [
          { text: __('No') },
          {
            text: __('Yes'),
            onPress: () => {
              abandonClaim(txid, nout);
              navigation.navigate({ routeName: Constants.DRAWER_ROUTE_CHANNEL_CREATOR });
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  render() {
    const { channels, claim, navigation, uri, drawerStack, popDrawerStack, sortByItem, timeItem } = this.props;
    const { name, permanent_url: permanentUrl } = claim;
    const { autoStyle, showSortPicker, showTimePicker } = this.state;
    const ownedChannel = channels ? channels.map(channel => channel.permanent_url).includes(permanentUrl) : false;

    let thumbnailUrl,
      coverUrl,
      title,
      fullUri,
      displayName = null,
      substrIndex = 0;
    if (claim) {
      if (claim.value) {
        title = claim.value.title;
        if (claim.value.cover) {
          coverUrl = claim.value.cover.url;
        }
        if (claim.value.thumbnail) {
          thumbnailUrl = claim.value.thumbnail.url;
        }
      }

      displayName = title || claim.name;
      substrIndex = displayName.startsWith('@') ? 1 : 0;
      fullUri = normalizeURI(`${claim.name}#${claim.claim_id}`);
    }

    return (
      <View style={channelPageStyle.container}>
        <UriBar value={uri} navigation={navigation} />

        <View style={channelPageStyle.viewContainer}>
          <View style={channelPageStyle.cover}>
            <Image
              style={channelPageStyle.coverImage}
              resizeMode={'cover'}
              source={
                coverUrl && coverUrl.trim().length > 0
                  ? { uri: coverUrl }
                  : require('../../assets/default_channel_cover.png')
              }
            />

            <View style={channelPageStyle.channelHeader}>
              <Text style={channelPageStyle.channelName}>{title && title.trim().length > 0 ? title : name}</Text>
            </View>

            <View style={[channelPageStyle.avatarImageContainer, autoStyle]}>
              {thumbnailUrl && (
                <Image style={channelPageStyle.avatarImage} resizeMode={'cover'} source={{ uri: thumbnailUrl }} />
              )}
              {(!thumbnailUrl || thumbnailUrl.trim().length === 0) && (
                <Text style={channelIconStyle.autothumbCharacter}>
                  {displayName.substring(substrIndex, substrIndex + 1).toUpperCase()}
                </Text>
              )}
            </View>

            <View style={channelPageStyle.subscribeButtonContainer}>
              {ownedChannel && (
                <Button
                  style={channelPageStyle.actionButton}
                  theme={'light'}
                  icon={'edit'}
                  text={'Edit'}
                  onPress={this.onEditPressed}
                />
              )}
              {ownedChannel && (
                <Button
                  style={channelPageStyle.deleteButton}
                  theme={'light'}
                  icon={'trash-alt'}
                  text={'Delete'}
                  onPress={this.onDeletePressed}
                />
              )}
              {!ownedChannel && <SubscribeButton style={channelPageStyle.subscribeButton} uri={fullUri} name={name} />}
              {!ownedChannel && (
                <SubscribeNotificationButton
                  style={[channelPageStyle.subscribeButton, channelPageStyle.bellButton]}
                  uri={fullUri}
                  name={name}
                />
              )}
            </View>
          </View>

          <View style={channelPageStyle.tabBar}>
            <TouchableOpacity
              style={channelPageStyle.tab}
              onPress={() => this.setState({ activeTab: Constants.CONTENT_TAB })}
            >
              <Text style={channelPageStyle.tabTitle}>CONTENT</Text>
              {Constants.CONTENT_TAB === this.state.activeTab && <View style={channelPageStyle.activeTabHint} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={channelPageStyle.tab}
              onPress={() => this.setState({ activeTab: Constants.ABOUT_TAB })}
            >
              <Text style={channelPageStyle.tabTitle}>ABOUT</Text>
              {Constants.ABOUT_TAB === this.state.activeTab && <View style={channelPageStyle.activeTabHint} />}
            </TouchableOpacity>
          </View>

          {Constants.CONTENT_TAB === this.state.activeTab && this.renderContent()}
          {Constants.ABOUT_TAB === this.state.activeTab && this.renderAbout()}
        </View>

        {showSortPicker && (
          <ModalPicker
            title={__('Sort content by')}
            onOverlayPress={() => this.setState({ showSortPicker: false })}
            onItemSelected={this.handleSortByItemSelected}
            selectedItem={sortByItem}
            items={Constants.CLAIM_SEARCH_SORT_BY_ITEMS}
          />
        )}
        {showTimePicker && (
          <ModalPicker
            title={__('Content from')}
            onOverlayPress={() => this.setState({ showTimePicker: false })}
            onItemSelected={this.handleTimeItemSelected}
            selectedItem={timeItem}
            items={Constants.CLAIM_SEARCH_TIME_ITEMS}
          />
        )}
      </View>
    );
  }
}

export default ChannelPage;
