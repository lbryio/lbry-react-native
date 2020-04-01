import { StyleSheet } from 'react-native';
import Colors from './colors';

const editorsChoiceStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PageBackground,
  },
  categories: {
    marginTop: 60,
  },
  categoriesContent: {
    padding: 16,
  },
  item: {
    flex: 1,
    marginTop: 8,
  },
  category: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: Colors.LbryGreen,
    marginBottom: 4,
  },
  thumbnail: {
    width: '100%',
    height: 240,
  },
  detailsContainer: {
    marginLeft: 8,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginTop: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 8,
  },
});

export default editorsChoiceStyle;
