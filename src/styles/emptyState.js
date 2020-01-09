import { StyleSheet } from 'react-native';
import Colors from './colors';

const emptyStateStyle = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingLeft: 24,
    paddingRight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  outerContainer: {
    top: 60,
  },
  innerContainer: {
    top: 0,
  },
  button: {
    backgroundColor: Colors.LbryGreen,
    fontSize: 18,
  },
  image: {
    width: 128,
    height: 170,
  },
  message: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 24,
  },
});

export default emptyStateStyle;
