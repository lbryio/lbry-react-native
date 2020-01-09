import { StyleSheet } from 'react-native';
import Colors from './colors';

const claimListStyle = StyleSheet.create({
  horizontalScrollContainer: {
    marginBottom: 12,
  },
  horizontalScrollPadding: {
    paddingLeft: 16,
  },
  verticalScrollContainer: {
    flex: 1,
  },
  noContentText: {
    color: Colors.DescriptionGrey,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    margin: 16,
    textAlign: 'center',
  },
  verticalScrollPadding: {
    paddingBottom: 16,
  },
  verticalListItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 8,
    marginRight: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  verticalLoading: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default claimListStyle;
