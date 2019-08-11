import { Dimensions, PixelRatio, StyleSheet } from 'react-native';
import Colors from './colors';

const screenDimension = Dimensions.get('window');
export const screenWidth = screenDimension.width;
export const screenHeight = screenDimension.height;
const screenWidthPixels = PixelRatio.getPixelSizeForLayoutSize(screenWidth);
const screenHeightPixels = PixelRatio.getPixelSizeForLayoutSize(screenHeight);
// calculate thumbnail width and height based on device's aspect ratio
export const horizontalMargin = 48; // left and right margins (24 + 24)
export const verticalMargin =
  screenWidthPixels > 720 && screenHeightPixels > 1920 ? 0 : screenWidthPixels <= 720 ? 20 : 16;
export const mediaWidth = screenWidth - horizontalMargin;
export const mediaHeight =
  (screenWidth / screenHeight) * (screenWidthPixels <= 720 ? screenWidth : mediaWidth) - verticalMargin;
export const fileItemWidth = (screenWidth * 3) / 5;
export const fileItemMediaWidth = fileItemWidth;
export const fileItemMediaHeight = (fileItemWidth * 9) / 16;

const discoverStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PageBackground,
  },
  drawerContentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    marginTop: 76,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 16,
    marginRight: 16,
  },
  rightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageTitle: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 24,
  },
  customizeLink: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 14,
    marginRight: 48,
  },
  trendingContainer: {
    flex: 1,
    marginTop: 60,
    paddingTop: 30,
  },
  busyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 20,
    textAlign: 'center',
    marginLeft: 10,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 16,
    marginRight: 16,
    marginTop: 6,
    marginBottom: 6,
  },
  footer: {
    marginTop: 12,
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 56,
  },
  footerTitle: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 20,
    marginBottom: 10,
  },
  footerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footerTag: {
    marginRight: 24,
    marginBottom: 12,
  },
  categoryName: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 18,
    color: Colors.Black,
  },
  fileItem: {
    width: fileItemWidth,
    marginRight: 12,
  },
  fileItemMore: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.LbryGreen,
    flexDirection: 'row',
    width: fileItemWidth,
    height: fileItemMediaHeight,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontFamily: 'Inter-UI-Regular',
    color: Colors.White,
    fontSize: 24,
  },
  moreIcon: {
    marginLeft: 12,
    marginBottom: -4,
  },
  fileItemMedia: {
    width: fileItemMediaWidth,
    height: fileItemMediaHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileItemName: {
    fontFamily: 'Inter-UI-SemiBold',
    marginTop: 8,
    fontSize: 14,
  },
  channelName: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 12,
    marginTop: 4,
    color: Colors.LbryGreen,
  },
  anonChannelName: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 12,
    marginTop: 4,
    color: Colors.DescriptionGrey,
  },
  downloadedIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
  filePriceContainer: {
    backgroundColor: Colors.NextLbryGreen,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 56,
    height: 24,
    borderRadius: 4,
  },
  filePriceText: {
    fontFamily: 'Inter-UI-Bold',
    fontSize: 12,
    textAlign: 'center',
    color: '#0c604b',
  },
  drawerMenuButton: {
    height: '100%',
    justifyContent: 'center',
  },
  drawerHamburger: {
    marginLeft: 16,
    marginRight: 16,
  },
  rightHeaderIcon: {
    marginRight: 16,
  },
  overlay: {
    flex: 1,
    opacity: 1,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  overlayText: {
    color: Colors.White,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter-UI-Regular',
  },
  rewardTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardIcon: {
    color: Colors.Red,
    flex: 0.1,
    textAlign: 'right',
    marginTop: 6,
  },
  rewardTitle: {
    flex: 0.9,
  },
  menuText: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
  },
  titleText: {
    fontFamily: 'Inter-UI-Regular',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTime: {
    marginTop: 2,
  },
  dateTimeText: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 12,
    color: Colors.DescriptionGrey,
  },
  scrollPadding: {
    paddingBottom: 24,
  },
  listLoading: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalScrollContainer: {
    marginBottom: 12,
  },
  horizontalScrollPadding: {
    paddingLeft: 20,
  },
  verticalClaimList: {
    flex: 1,
  },
  tagPageTitle: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 24,
  },
  tagPageClaimList: {
    flex: 1,
  },
  tagTitleRow: {
    marginTop: 76,
    marginLeft: 16,
    marginRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagSortBy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  tagTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagSortText: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 14,
    marginRight: 4,
  },
  tagSortIcon: {
    marginTop: -6,
  },
});

export default discoverStyle;
