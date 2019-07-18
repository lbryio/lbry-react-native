import { StyleSheet } from 'react-native';
import Colors from './colors';

const claimListStyle = StyleSheet.create({
  horizontalScrollContainer: {
    marginBottom: 12,
  },
  horizontalScrollPadding: {
    paddingLeft: 20,
  },
  verticalScrollContainer: {
    flex: 1
  },
  verticalScrollPadding: {
    paddingBottom: 16
  },
  verticalListItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginLeft: 8,
    marginRight: 8,
  },
  verticalLoading: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default claimListStyle;
