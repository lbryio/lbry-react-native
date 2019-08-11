import { StyleSheet } from 'react-native';
import Colors from './colors';

const channelIconStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  placeholderText: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 14,
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: 160,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderedThumbnailContainer: {
    borderWidth: 1,
    borderColor: Colors.LighterGrey,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
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
  title: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 12,
    width: 80,
    marginTop: 4,
    textAlign: 'center',
  },
  autothumbCharacter: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 48,
    color: Colors.White,
  },
});

export default channelIconStyle;
