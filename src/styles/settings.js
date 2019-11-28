import { StyleSheet } from 'react-native';
import Colors from './colors';

const settingsStyle = StyleSheet.create({
  container: {
    backgroundColor: Colors.PageBackground,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
  },
  scrollContainer: {
    padding: 16,
  },
  row: {
    marginBottom: 24,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchText: {
    width: '70%',
    justifyContent: 'center',
  },
  switchContainer: {
    width: '25%',
    justifyContent: 'center',
  },
  pickerText: {
    width: '50%',
  },
  pickerContainer: {
    width: '50%',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-UI-Regular',
    lineHeight: 18,
  },
  description: {
    color: '#aaaaaa',
    fontSize: 12,
    fontFamily: 'Inter-UI-Regular',
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 20,
    marginBottom: 4,
  },
  sectionDescription: {
    color: '#aaaaaa',
    fontFamily: 'Inter-UI-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  sectionDivider: {
    marginTop: 24,
  },
});

export default settingsStyle;
