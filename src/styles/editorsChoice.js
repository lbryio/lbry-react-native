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
// taller thumbnails
const thumbnailHeight = (screenWidth / screenHeight) * thumbnailWidth - verticalAdjust;

const editorsChoiceStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PageBackground,
  },
  categories: {
    marginTop: 60,
  },
  categoriesContent: {
    padding: 16,
  },
  item: {
    flex: 1,
    marginTop: 8,
    marginBottom: 12,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  category: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: Colors.LbryGreen,
  },
  thumbnail: {
    width: thumbnailWidth,
    height: thumbnailHeight,
    marginRight: screenWidthPixels <= 720 ? 10 : 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 2,
    paddingRight: 2,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 2,
  },
});

export default editorsChoiceStyle;
