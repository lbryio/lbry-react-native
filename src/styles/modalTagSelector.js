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
    alignItems: 'center',
  },
  overlayTouchArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: Colors.White,
    padding: 16,
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
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
    fontFamily: 'Inter-Regular',
    fontSize: 24,
  },
  buttons: {
    marginTop: 16,
  },
  doneButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.LbryGreen,
    paddingLeft: 16,
    paddingRight: 16,
  },
});

export default modalTagSelectorStyle;
