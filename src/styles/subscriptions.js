import { StyleSheet } from 'react-native';
import { screenWidth, horizontalMargin, mediaWidth, mediaHeight } from 'styles/discover';
import Colors from 'styles/colors';

const subscriptionsStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PageBackground,
  },
  subContainer: {
    flex: 1,
  },
  suggestedSubsContainer: {
    flex: 1,
  },
  suggestedScrollContent: {
    paddingTop: 8,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.LbryGreen,
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 8,
  },
  busyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollPadding: {
    paddingTop: 24,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  infoArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 16,
    marginRight: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LighterGrey,
  },
  suggestedContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: 16,
  },
  contentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 24,
    marginRight: 24,
    marginBottom: 8,
  },
  fileItem: {
    marginLeft: 24,
    marginRight: 24,
    marginBottom: 24,
  },
  compactMainFileItem: {
    marginLeft: 24,
    marginRight: 24,
  },
  compactItems: {
    flex: 1,
    marginTop: 6,
    marginLeft: 20,
    marginRight: 24,
    marginBottom: 24,
    height: 80,
  },
  compactFileItem: {
    width: (screenWidth - horizontalMargin - 6 * 3) / 3,
    marginLeft: 6,
    height: '100%',
  },
  compactFileItemMedia: {
    width: (screenWidth - horizontalMargin) / 3,
    height: '100%',
  },
  fileItemMedia: {
    width: mediaWidth,
    height: mediaHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileItemName: {
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    fontSize: 18,
  },
  channelList: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    paddingBottom: 8,
    borderBottomColor: Colors.LighterGrey,
    borderBottomWidth: 1,
  },
  channelTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginLeft: 24,
    marginTop: 16,
    marginBottom: 16,
    color: Colors.LbryGreen,
  },
  subscribeButton: {
    alignSelf: 'flex-start',
    marginRight: 24,
    marginTop: 8,
    backgroundColor: Colors.White,
    paddingLeft: 16,
    paddingRight: 16,
  },
  viewModeRow: {
    flexDirection: 'row',
    marginLeft: 24,
    marginRight: 24,
    marginTop: 84,
  },
  viewModeLink: {
    marginRight: 24,
    fontSize: 18,
    color: Colors.LbryGreen,
  },
  inactiveMode: {
    fontFamily: 'Inter-Regular',
  },
  activeMode: {
    fontFamily: 'Inter-SemiBold',
  },
  claimList: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 24,
  },
  titleRow: {
    marginTop: 76,
    marginLeft: 16,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  tagSortBy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  tagSortText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginRight: 4,
  },
  tagSortIcon: {
    marginTop: -6,
  },
  centered: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedItem: {
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    height: 120,
  },
  suggestedItemThumbnailContainer: {
    width: 70,
    height: 70,
    borderRadius: 140,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedItemThumbnail: {
    width: '100%',
    height: '100%',
  },
  suggestedItemDetails: {
    marginLeft: 16,
    marginRight: 16,
  },
  suggestedItemSubscribe: {
    backgroundColor: Colors.White,
  },
  suggestedItemSubscribeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
    height: 70,
  },
  suggestedItemTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 4,
  },
  suggestedItemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 4,
    color: Colors.LbryGreen,
  },
  suggestedItemTagList: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  suggestedSubTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 12,
  },
  suggestedSectionSeparator: {
    marginBottom: 16,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
  },
  leftPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedLink: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  modalContainer: {
    height: '80%',
    backgroundColor: Colors.PageBackground,
  },
  modalScrollContainer: {
    marginBottom: 50,
  },
  modalSuggestedScrollContent: {
    paddingTop: 16,
  },
  suggestedDoneButton: {
    backgroundColor: Colors.LbryGreen,
    margin: 16,
  },
  mainSuggested: {
    flex: 1,
  },
  suggestedLoading: {
    position: 'absolute',
    right: 24,
    bottom: 22,
  },
});

export default subscriptionsStyle;
