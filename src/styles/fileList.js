import { Dimensions, PixelRatio, StyleSheet } from 'react-native';
import { mediaWidth, mediaHeight } from './discover';
import Colors from './colors';

const screenDimension = Dimensions.get('window');
const screenWidth = screenDimension.width;
const screenHeight = screenDimension.height;
const screenWidthPixels = PixelRatio.getPixelSizeForLayoutSize(screenWidth);
const screenHeightPixels = PixelRatio.getPixelSizeForLayoutSize(screenHeight);
const verticalAdjust = screenHeightPixels > 1280 && screenHeightPixels <= 1920 ? 6 : 0;
const thumbnailWidth = screenWidthPixels <= 720 ? 144 : 156;
const thumbnailHeight = (screenWidth / screenHeight) * thumbnailWidth - verticalAdjust;

const fileListStyle = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailsContainer: {
    flex: 1,
  },
  featuredUri: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: Colors.White,
  },
  featuredTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: screenWidthPixels <= 720 ? 11 : 16,
    color: Colors.White,
  },
  thumbnail: {
    backgroundColor: Colors.ThumbnailPlaceholder,
    width: thumbnailWidth,
    height: thumbnailHeight,
    marginRight: screenWidthPixels <= 720 ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelThumbnailView: {
    width: thumbnailWidth,
    height: thumbnailHeight,
    marginRight: screenWidthPixels <= 720 ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelThumbnailContainer: {
    width: thumbnailHeight, // maintain same width and height
    height: thumbnailHeight,
    borderRadius: 140,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelThumbnail: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: thumbnailWidth,
    height: thumbnailHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000aa',
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: screenWidthPixels <= 720 ? 11 : 14,
  },
  uri: {
    fontFamily: 'Inter-SemiBold',
    fontSize: screenWidthPixels <= 720 ? 11 : 14,
    marginBottom: 8,
  },
  publisher: {
    fontFamily: 'Inter-SemiBold',
    fontSize: screenWidthPixels <= 720 ? 10 : 12,
    marginTop: screenWidthPixels <= 720 ? 1 : 3,
    color: Colors.LbryGreen,
  },
  channelContainer: {
    alignItems: 'center',
  },
  loading: {
    position: 'absolute',
  },
  info: {
    marginTop: screenWidthPixels <= 720 ? 1 : 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: screenWidthPixels <= 720 ? 10 : 12,
    color: Colors.ChannelGrey,
  },
  downloadInfo: {
    marginTop: 2,
  },
  progress: {
    marginTop: screenWidthPixels <= 720 ? 1 : 4,
  },
  progressCompleted: {
    backgroundColor: Colors.LbryGreen,
  },
  progressRemaining: {
    backgroundColor: Colors.LbryGreen,
    opacity: 0.2,
  },
  downloadedIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  featuredDownloadedIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
  },
  fileItem: {
    marginLeft: 24,
    marginRight: 24,
    marginBottom: 48,
  },
  fileItemMedia: {
    width: mediaWidth,
    height: mediaHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    marginRight: 16,
  },
  rewardIcon: {
    color: Colors.NextLbryGreen,
    textAlign: 'right',
    marginLeft: 4,
    marginTop: 4,
  },
  filePriceContainer: {
    backgroundColor: Colors.NextLbryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'absolute',
    left: thumbnailWidth - 60,
    top: 4,
    width: 56,
    height: 24,
    borderRadius: 4,
  },
  filePriceText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    textAlign: 'center',
    color: '#0c604b',
  },
  filePriceIcon: {
    marginRight: 2,
    color: '#0c604b',
  },
  repostChannelName: {
    color: Colors.DescriptionGrey,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  repostIcon: {
    color: Colors.DescriptionGrey,
    marginRight: 4,
  },
  repostInfo: {
    marginLeft: 16,
    marginRight: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default fileListStyle;
