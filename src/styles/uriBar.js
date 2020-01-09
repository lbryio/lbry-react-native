import { StyleSheet } from 'react-native';
import { TITLE_OFFSET } from 'styles/pageHeader';
import Colors from './colors';

const uriBarStyle = StyleSheet.create({
  uriContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.White,
    padding: 8,
    alignSelf: 'flex-start',
    height: 60,
    width: '100%',
    shadowColor: Colors.Black,
    shadowOpacity: 0.1,
    shadowRadius: StyleSheet.hairlineWidth,
    shadowOffset: {
      height: StyleSheet.hairlineWidth,
    },
  },
  containerElevated: {
    elevation: 4,
  },
  drawerHamburger: {
    marginLeft: 16,
    marginRight: 16,
  },
  uriText: {
    backgroundColor: Colors.VeryLightGrey,
    borderRadius: 24,
    paddingLeft: 12,
    paddingRight: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 18,
    flex: 17,
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'red',
    top: 0,
    width: '100%',
    zIndex: 200,
  },
  overlayElevated: {
    elevation: 16,
  },
  inFocus: {
    height: '100%',
  },
  suggestions: {
    backgroundColor: 'white',
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  itemContent: {
    marginLeft: 12,
    marginRight: 12,
    flex: 1,
  },
  itemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  itemDesc: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.UriDescBlue,
  },
  drawerMenuButton: {
    height: '100%',
    justifyContent: 'center',
    flex: 3,
  },
  selectionModeBar: {
    flex: 1,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectionModeLeftBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  selectionModeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backTouchArea: {
    height: '100%',
    alignItems: 'center',
  },
  leftAction: {
    marginRight: 16,
  },
  actionTouchArea: {
    height: '100%',
    alignItems: 'center',
  },
  itemCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 20,
    marginLeft: 30,
  },
});

export default uriBarStyle;
