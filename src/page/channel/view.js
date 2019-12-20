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
import { navigateBack, getOrderBy, formatLbryUrlForWeb } from 'utils/helper';
import ChannelIconItem from 'component/channelIconItem';
import ClaimList from 'component/claimList';
import Colors from 'styles/colors';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import Button from 'component/button';
import EmptyStateView from 'component/emptyStateView';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Link from 'component/link';
import ModalPicker from 'component/modalPicker';
import ModalTipView from 'component/modalTipView';
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
    showTipView: false,
    orderBy: ['release_time'], // sort by new by default
    activeTab: Constants.CONTENT_TAB,
    currentSortByItem: Constants.CLAIM_SEARCH_SORT_BY_ITEMS[1], // should always default to sorting channel pages by new
  };

  componentWillMount() {
    this.setState({
      autoStyle:
        ChannelIconItem.AUTO_THUMB_STYLES[Math.floor(Math.random() * ChannelIconItem.AUTO_THUMB_STYLES.length)],
    });
  }

  componentDidMount() {
    const { claim, fetchChannelListMine, fetchSubCount } = this.props;
    NativeModules.Firebase.setCurrentScreen('Channel');
    fetchChannelListMine();
    if (claim) {
      fetchSubCount(claim.claim_id);
    }
  }

  handleSortByItemSelected = item => {
    // sort by specific only to this component state
    this.setState({ currentSortByItem: item, orderBy: getOrderBy(item), showSortPicker: false });
  };

  handleTimeItemSelected = item => {
    const { setTimeItem } = this.props;
    setTimeItem(item);
    this.setState({ showTimePicker: false });
  };

  listHeader = () => {
    const { timeItem } = this.props;
    const { currentSortByItem } = this.state;

    return (
      <View style={channelPageStyle.listHeader}>
        <View style={discoverStyle.pickerRow}>
          <View style={discoverStyle.leftPickerRow}>
            <TouchableOpacity style={discoverStyle.tagSortBy} onPress={() => this.setState({ showSortPicker: true })}>
              <Text style={discoverStyle.tagSortText}>{__(currentSortByItem.label.split(' ')[0])}</Text>
              <Icon style={discoverStyle.tagSortIcon} name={'sort-down'} size={14} />
            </TouchableOpacity>
            {Constants.SORT_BY_TOP === currentSortByItem.name && (
              <TouchableOpacity style={discoverStyle.tagTime} onPress={() => this.setState({ showTimePicker: true })}>
                <Text style={discoverStyle.tagSortText}>{__(timeItem.label)}</Text>
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
            <Text style={channelPageStyle.infoText}>{__('No information to display.')}</Text>
          </View>
        </View>
      );
    }

    const { cover, description, thumbnail, email, website_url: websiteUrl, title } = claim.value;
    return (
      <View style={channelPageStyle.aboutTab}>
        {!websiteUrl && !email && !description && (
          <EmptyStateView message={__("There's nothing here yet.\nPlease check back later.")} />
        )}

        {(websiteUrl || email || description) && (
          <ScrollView style={channelPageStyle.aboutScroll} contentContainerStyle={channelPageStyle.aboutScrollContent}>
            {websiteUrl && websiteUrl.trim().length > 0 && (
              <View style={channelPageStyle.aboutItem}>
                <Text style={channelPageStyle.aboutTitle}>{__('Website')}</Text>
                <Link style={channelPageStyle.aboutText} text={websiteUrl} href={websiteUrl} />
              </View>
            )}

            {email && email.trim().length > 0 && (
              <View style={channelPageStyle.aboutItem}>
                <Text style={channelPageStyle.aboutTitle}>{__('Email')}</Text>
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

  onTipPressed = () => {
    this.setState({ showTipView: true });
  };

  onSharePressed = () => {
    const { claim } = this.props;
    if (claim) {
      const { canonical_url: canonicalUrl, short_url: shortUrl, permanent_url: permanentUrl } = claim;
      const url = Constants.SHARE_BASE_URL + formatLbryUrlForWeb(canonicalUrl || shortUrl || permanentUrl);
      NativeModules.UtilityModule.shareUrl(url);
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
    const { channels, claim, navigation, uri, drawerStack, popDrawerStack, subCount, timeItem } = this.props;
    const { name, permanent_url: permanentUrl } = claim;
    const { autoStyle, currentSortByItem, showSortPicker, showTimePicker, showTipView } = this.state;
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
              <Text style={[channelPageStyle.followerCount, subCount >= 1 ? channelPageStyle.followerCountBg : null]}>
                {subCount === 1 && __('%follower% follower', { follower: subCount })}
                {subCount > 1 && __('%follower% followers', { follower: subCount })}
              </Text>
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
                  text={__('Edit')}
                  onPress={this.onEditPressed}
                />
              )}
              {ownedChannel && (
                <Button
                  style={[channelPageStyle.actionButton, channelPageStyle.deleteButton]}
                  theme={'light'}
                  icon={'trash-alt'}
                  text={__('Delete')}
                  onPress={this.onDeletePressed}
                />
              )}
              <Button
                style={[channelPageStyle.actionButton, channelPageStyle.shareButton]}
                theme={'light'}
                icon={'share-alt'}
                onPress={this.onSharePressed}
              />
              <Button
                style={[channelPageStyle.actionButton, channelPageStyle.tipButton]}
                theme={'light'}
                icon={'gift'}
                onPress={this.onTipPressed}
              />
              {!ownedChannel && <SubscribeButton style={channelPageStyle.subscribeButton} uri={fullUri} name={name} />}
              {false && !ownedChannel && (
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
              <Text style={channelPageStyle.tabTitle}>{__('CONTENT')}</Text>
              {Constants.CONTENT_TAB === this.state.activeTab && <View style={channelPageStyle.activeTabHint} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={channelPageStyle.tab}
              onPress={() => this.setState({ activeTab: Constants.ABOUT_TAB })}
            >
              <Text style={channelPageStyle.tabTitle}>{__('ABOUT')}</Text>
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
            selectedItem={currentSortByItem}
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
        {showTipView && (
          <ModalTipView
            claim={claim}
            channelName={claim.name}
            contentName={title}
            onCancelPress={() => this.setState({ showTipView: false })}
            onOverlayPress={() => this.setState({ showTipView: false })}
            onSendTipSuccessful={() => this.setState({ showTipView: false })}
          />
        )}
      </View>
    );
  }
}

export default ChannelPage;
