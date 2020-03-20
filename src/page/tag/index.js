import { connect } from 'react-redux';
import { selectFollowedTags, doToggleTagFollow } from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doSetSortByItem, doSetTimeItem } from 'redux/actions/settings';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import { selectSdkReady, selectSortByItem, selectTimeItem } from 'redux/selectors/settings';
import TagPage from './view';

const select = state => ({
  currentRoute: selectCurrentRoute(state),
  sdkReady: selectSdkReady(state),
  sortByItem: selectSortByItem(state),
  timeItem: selectTimeItem(state),
  followedTags: selectFollowedTags(state),
});

const perform = dispatch => ({
  pushDrawerStack: (routeName, params) => dispatch(doPushDrawerStack(routeName, params)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
  setSortByItem: item => dispatch(doSetSortByItem(item)),
  setTimeItem: item => dispatch(doSetTimeItem(item)),
  toggleTagFollow: tag => dispatch(doToggleTagFollow(tag)),
});

export default connect(select, perform)(TagPage);
