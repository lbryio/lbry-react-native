import { StyleSheet } from 'react-native';
import Colors from './colors';

const walletStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PageBackground,
  },
  scrollContainer: {
    marginTop: 60,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
  amountRow: {
    flexDirection: 'row',
  },
  address: {
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.8,
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderColor: '#e1e1e1',
    backgroundColor: '#f9f9f9',
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 6,
    width: '85%',
  },
  button: {
    backgroundColor: Colors.LbryGreen,
    alignSelf: 'flex-start',
  },
  enrollButton: {
    backgroundColor: Colors.LbryGreen,
    marginLeft: 12,
  },
  historyList: {
    backgroundColor: Colors.White,
  },
  card: {
    backgroundColor: Colors.White,
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    padding: 16,
  },
  warningCard: {
    backgroundColor: Colors.Orange,
    padding: 16,
    marginLeft: 16,
    marginTop: 16,
    marginRight: 16,
  },
  transactionsCard: {
    backgroundColor: Colors.White,
    margin: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 24,
  },
  transactionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
  },
  transactionsHeader: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  text: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  link: {
    color: Colors.LbryGreen,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  smallText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  balanceCard: {
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
  },
  balanceBackground: {
    position: 'absolute',
    alignSelf: 'stretch',
    width: '100%',
    height: '100%',
  },
  balanceTitle: {
    color: Colors.White,
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginLeft: 16,
    marginTop: 16,
  },
  balanceCaption: {
    color: '#caedB9',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 96,
  },
  balance: {
    color: Colors.White,
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    marginLeft: 16,
    marginBottom: 16,
  },
  balanceFocus: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 24,
  },
  balanceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 4,
  },
  infoText: {
    color: '#aaaaaa',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    padding: 16,
    textAlign: 'center',
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  amountInput: {
    alignSelf: 'flex-start',
    width: 100,
    fontSize: 16,
    letterSpacing: 1,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 1.5,
    marginRight: 8,
  },
  warning: {
    backgroundColor: Colors.Orange,
    padding: 16,
    margin: 16,
    marginTop: 76,
  },
  warningParagraph: {
    color: Colors.White,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  warningText: {
    color: Colors.White,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  understand: {
    marginLeft: 16,
    padding: 12,
    paddingLeft: 18,
    paddingRight: 18,
  },
  currency: {
    alignSelf: 'flex-start',
    fontSize: 12,
    marginTop: 16,
    marginLeft: 4,
  },
  sendButton: {
    marginTop: 8,
  },
  bottomMarginSmall: {
    marginBottom: 8,
  },
  bottomMarginMedium: {
    marginBottom: 16,
  },
  bottomMarginLarge: {
    marginBottom: 24,
  },
  transactionHistoryScroll: {
    marginTop: 60,
  },
  rewardDriverCard: {
    alignItems: 'center',
    backgroundColor: Colors.RewardDriverBlue,
    flexDirection: 'row',
    padding: 16,
    marginLeft: 16,
    marginTop: 16,
    marginRight: 16,
  },
  rewardDriverText: {
    color: Colors.White,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 16,
  },
  rewardIcon: {
    color: Colors.White,
    marginRight: 8,
  },
  syncDriverCard: {
    backgroundColor: Colors.White,
    marginLeft: 16,
    marginBottom: 16,
    marginRight: 16,
  },
  syncDriverTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    paddingLeft: 16,
    marginTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.PageBackground,
  },
  syncDriverLink: {
    color: Colors.LbryGreen,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  actionRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchRow: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.PageBackground,
  },
  tableRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.PageBackground,
  },
  tableCol: {
    flex: 0.5,
  },
  tableColRow: {
    flex: 0.5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  rightTableCol: {
    flex: 0.5,
    justifyContent: 'flex-end',
  },
  labelText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  valueText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  rightLink: {
    alignSelf: 'flex-end',
  },
  syncSwitch: {
    marginLeft: 8,
  },
  loadingContainer: {
    position: 'absolute',
    flexDirection: 'row',
    left: 0,
    right: 0,
    top: 60,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#aaaaaa',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  buttonRow: {
    width: '100%',
    position: 'absolute',
    alignItems: 'center',
    left: 24,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  continueLink: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.White,
  },
  learnMoreLink: {
    fontFamily: 'Inter-Regular',
    color: Colors.NextLbryGreen,
  },
  signInButton: {
    backgroundColor: Colors.White,
    paddingLeft: 16,
    paddingRight: 16,
  },
  signInContainer: {
    flex: 1,
    marginTop: 60,
    padding: 24,
    backgroundColor: Colors.LbryGreen,
  },
  onboarding: {
    marginTop: 36,
  },
  onboardingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    lineHeight: 28,
    color: Colors.White,
  },
  signInSummaryRow: {
    flexDirection: 'row',
  },
  signInTitle: {
    color: Colors.White,
    fontFamily: 'Inter-Regular',
    fontSize: 28,
  },
});

export default walletStyle;
