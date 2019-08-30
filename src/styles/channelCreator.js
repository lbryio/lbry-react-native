import { Dimensions, StyleSheet } from 'react-native';
import Colors from './colors';

const screenDimension = Dimensions.get('window');
const screenWidth = screenDimension.width;

const channelCreatorStyle = StyleSheet.create({
  card: {
    backgroundColor: Colors.White,
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    padding: 16,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.PageBackground,
  },
  channelPicker: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
    height: 52,
    width: '100%',
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
  },
  channelNameInput: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
    paddingLeft: 20,
  },
  bidAmountInput: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
    marginLeft: 16,
    textAlign: 'right',
    width: 80,
  },
  helpText: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 12,
  },
  channelTitleInput: {
    marginBottom: 4,
  },
  createChannelContainer: {
    marginTop: 60,
    flex: 1,
  },
  channelAt: {
    position: 'absolute',
    left: 4,
    top: 13,
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  buttons: {
    marginLeft: 16,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelLink: {
    marginRight: 16,
  },
  createButton: {
    backgroundColor: Colors.LbryGreen,
    alignSelf: 'flex-end',
  },
  inlineError: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 12,
    color: Colors.Red,
    marginTop: 2,
  },
  imageSelectors: {
    width: '100%',
    height: 160,
  },
  coverImageTouchArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  avatarImageContainer: {
    position: 'absolute',
    left: screenWidth / 2 - 80 / 2,
    bottom: -16,
    width: 80,
    height: 80,
    borderRadius: 160,
    overflow: 'hidden',
  },
  avatarTouchArea: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  listFooterView: {
    marginTop: 24,
  },
  createChannelButton: {
    backgroundColor: Colors.LbryGreen,
    alignSelf: 'flex-start',
  },
  scrollContainer: {
    marginTop: 60,
    marginLeft: 16,
    marginRight: 16,
  },
  scrollPadding: {
    paddingTop: 16,
  },
  channelListItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  channelListName: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 18,
  },
  channelListAvatar: {
    marginRight: 16,
    width: 80,
    height: 80,
    borderRadius: 160,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default channelCreatorStyle;
