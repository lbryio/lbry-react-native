import { StyleSheet } from 'react-native';
import Colors from './colors';

const modalTagSelectorStyle = StyleSheet.create({
  overlay: {
    backgroundColor: '#00000099',
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
    padding: 16,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  titleRow: {
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 24,
  },
  buttons: {
    marginTop: 16,
  },
  doneButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.LbryGreen,
  },
});

export default modalTagSelectorStyle;
