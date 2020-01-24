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
  button: {
    backgroundColor: Colors.LbryGreen,
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: Colors.White,
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    marginBottom: 8,
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
  rewardDriverCard: {
    alignItems: 'center',
    backgroundColor: Colors.RewardDriverBlue,
    flexDirection: 'row',
    padding: 16,
    marginLeft: 16,
    marginTop: 16,
    marginRight: 16,
  },
  rewardDriverIcon: {
    color: Colors.White,
    marginRight: 8,
  },
  rewardDriverText: {
    fontFamily: 'Inter-Regular',
    color: Colors.White,
    fontSize: 14,
  },
  subTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  customizeTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 12,
  },
  inviteLink: {
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderColor: '#e1e1e1',
    backgroundColor: '#f9f9f9',
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 6,
    width: '88%',
  },
  emailInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  loading: {
    marginRight: 8,
  },
  lastCard: {
    marginBottom: 16,
  },
  invitees: {
    marginTop: 8,
  },
  inviteesHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emailHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    width: '50%',
  },
  statusHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    width: '30%',
  },
  rewardHeader: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    width: '20%',
  },
  inviteeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inviteeEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    width: '50%',
  },
  inviteStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    width: '30%',
  },
  rewardStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    width: '20%',
  },
});

export default walletStyle;
