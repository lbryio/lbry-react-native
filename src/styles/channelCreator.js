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
  balance: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 14,
    marginLeft: 24,
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
    color: Colors.DescriptionGrey,
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
    marginBottom: 16,
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
    bottom: -8,
    width: 80,
    height: 80,
    borderRadius: 160,
    overflow: 'hidden',
    zIndex: 50,
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
  listFooter: {
    marginTop: 8,
  },
  createChannelButton: {
    backgroundColor: Colors.LbryGreen,
    alignSelf: 'flex-start',
  },
  scrollContainer: {
    marginTop: 60,
  },
  scrollPadding: {
    padding: 16,
  },
  channelListItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  channelListTitle: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 18,
    marginBottom: 4,
  },
  channelListName: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 14,
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
  selectedOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 80,
    height: 80,
    borderRadius: 160,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000aa',
  },
  listHeader: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  textInputLayout: {
    marginBottom: 4,
  },
  textInputTitle: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 12,
    marginBottom: -10,
    marginLeft: 4,
  },
  inputText: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
  },
  toggleContainer: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modeLink: {
    color: Colors.LbryGreen,
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  cardTitle: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 20,
    marginBottom: 8,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  editOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    position: 'absolute',
    padding: 8,
    left: 4,
    bottom: 4,
    backgroundColor: '#00000077',
  },
  thumbnailEditOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    position: 'absolute',
    padding: 8,
    left: 80 / 2 - 32 / 2,
    bottom: 4,
    backgroundColor: '#00000077',
  },
  editIcon: {
    color: Colors.White,
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 12,
  },
  uploadProgress: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00000077',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    justifyContent: 'center',
  },
  uploadText: {
    color: Colors.White,
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 12,
    marginLeft: 4,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default channelCreatorStyle;
