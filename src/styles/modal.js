import { StyleSheet } from 'react-native';
import Colors from './colors';

const modalPickerStyle = StyleSheet.create({
  overlay: {
    backgroundColor: '#00000055',
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 300,
  },
  overlayTouchArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 8,
    backgroundColor: Colors.White,
    overflow: 'hidden',
  },
  paddedContatiner: {
    padding: 12,
  },
  buttons: {
    marginTop: 16,
    left: 8,
    bottom: 8,
    position: 'absolute',
  },
  doneButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.LbryGreen,
    paddingLeft: 16,
    paddingRight: 16,
  },
});

export default modalPickerStyle;
