import { StyleSheet } from 'react-native';
import Colors from './colors';

const modalRepostStyle = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  depositAmountInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    alignSelf: 'flex-start',
    textAlign: 'right',
    width: 80,
    letterSpacing: 1,
  },
  currency: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginLeft: 4,
  },
  buttonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    backgroundColor: Colors.LbryGreen,
  },
  cancelLink: {
    color: Colors.Grey,
  },
  advancedLink: {
    color: Colors.Grey,
    marginRight: 16,
  },
  balance: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 24,
  },
  balanceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 4,
  },
  info: {
    marginTop: 4,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.DescriptionGrey,
  },
  learnMoreLink: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.LbryGreen,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginTop: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});

export default modalRepostStyle;
