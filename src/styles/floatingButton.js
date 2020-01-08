import { StyleSheet } from 'react-native';
import Colors from './colors';

const floatingButtonStyle = StyleSheet.create({
  view: {
    position: 'absolute',
    zIndex: 100,
    borderRadius: 24,
    padding: 14,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  container: {
    zIndex: 100,
    borderRadius: 24,
    padding: 10,
    paddingLeft: 16,
    paddingRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: Colors.LbryGreen,
    shadowColor: Colors.Black,
    shadowOpacity: 0.1,
    shadowRadius: StyleSheet.hairlineWidth,
    shadowOffset: {
      height: StyleSheet.hairlineWidth,
    },
    elevation: 4,
  },
  pendingContainer: {
    borderRadius: 24,
    padding: 10,
    paddingLeft: 12,
    paddingRight: 58,
    marginRight: -52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BrighterLbryGreen,
    flexDirection: 'row',
    elevation: 3,
  },
  text: {
    color: Colors.White,
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 16,
  },
  bottomRight: {
    right: 0,
    bottom: 0,
  },
  rewardIcon: {
    color: Colors.White,
    marginRight: 3,
  },
  balanceIcon: {
    color: Colors.White,
    marginRight: 3,
    marginTop: -1,
  },
});

export default floatingButtonStyle;
