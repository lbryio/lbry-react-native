import { StyleSheet } from 'react-native';
import Colors from './colors';

const channelPageStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.PageBackground,
  },
  content: {
    flex: 1,
  },
  viewContainer: {
    flex: 1,
    marginTop: 60,
  },
  fileList: {
    flex: 1,
    paddingTop: 30,
  },
  fileListContent: {
    paddingBottom: 16,
  },
  title: {
    color: Colors.LbryGreen,
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 30,
    margin: 16,
  },
  busyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  infoText: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 20,
    textAlign: 'center',
  },
  pageButtons: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  button: {
    backgroundColor: Colors.LbryGreen,
    paddingLeft: 16,
    paddingRight: 16,
  },
  nextButton: {
    alignSelf: 'flex-end',
  },
  channelHeader: {
    position: 'absolute',
    left: 120,
    bottom: 4,
  },
  channelName: {
    color: Colors.White,
    fontFamily: 'Inter-UI-Regular',
    fontSize: 18,
  },
  subscribeButtonContainer: {
    position: 'absolute',
    flexDirection: 'row',
    right: 8,
    bottom: -90,
    zIndex: 100,
  },
  subscribeButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.White,
    paddingLeft: 16,
    paddingRight: 16,
  },
  bellButton: {
    marginLeft: 8,
  },
  cover: {
    width: '100%',
    height: '20%',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  tabBar: {
    height: 45,
    backgroundColor: Colors.LbryGreen,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tabTitle: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 14,
    color: Colors.White,
  },
  tab: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabHint: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: Colors.White,
    height: 3,
    width: '100%',
  },
  contentTab: {
    flex: 1,
  },
  aboutTab: {
    flex: 1,
  },
  aboutScroll: {
    flex: 1,
  },
  aboutItem: {
    marginBottom: 24,
  },
  aboutScrollContent: {
    paddingTop: 52,
    padding: 24,
  },
  aboutTitle: {
    fontFamily: 'Inter-UI-SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  aboutText: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  avatarImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 160,
    position: 'absolute',
    overflow: 'hidden',
    left: 24,
    bottom: -24,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  listHeader: {
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
    marginRight: 16,
  },
  claimList: {
    flex: 1,
  },
  claimListContent: {
    paddingTop: 16,
  },
  actionButton: {
    backgroundColor: Colors.White,
  },
  deleteButton: {
    marginLeft: 8,
  },
  shareButton: {
    marginLeft: 8,
    marginRight: 8,
  },
  followerCount: {
    fontFamily: 'Inter-UI-Regular',
    fontSize: 12,
    color: Colors.White,
    marginTop: 2,
  },
});

export default channelPageStyle;
