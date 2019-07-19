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
    padding: 12
  },
  title: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase'
  },
  listItem: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  divider: {
    marginTop: 12,
    marginBottom: 8,
    borderBottomColor: Colors.LighterGrey,
    borderBottomWidth: 1,
    width: '100%'
  },
  itemIcon: {
    marginLeft: 8,
    marginRight: 12,
  },
  itemLabel: {
    alignSelf: 'flex-start',
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16
  },
  itemSelected: {
    position: 'absolute',
    right: 8
  }
});

export default modalPickerStyle;
