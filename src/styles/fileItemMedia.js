import { StyleSheet } from 'react-native';
import Colors from './colors';

const fileItemMediaStyle = StyleSheet.create({
  autothumb: {
    flex: 1,
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autothumbText: {
    fontFamily: 'Inter-UI-SemiBold',
    textAlign: 'center',
    color: Colors.White,
    fontSize: 40,
  },
  resolving: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    color: '#ffffff',
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    flex: 1,
    width: '100%',
    height: 200,
    shadowColor: 'transparent',
  },
  duration: {
    backgroundColor: Colors.Black,
    position: 'absolute',
    right: 4,
    bottom: 4,
    paddingLeft: 2,
    paddingRight: 2,
  },
  durationText: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 12,
    color: Colors.White,
  },
});

export default fileItemMediaStyle;
