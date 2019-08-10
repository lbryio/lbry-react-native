import { connect } from 'react-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { doSetSortByItem } from 'redux/actions/settings';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import { selectSortByItem } from 'redux/selectors/settings';
import TagPage from './view';

const select = state => ({
  currentRoute: selectCurrentRoute(state),
  sortByItem: selectSortByItem(state),
});

const perform = dispatch => ({
  pushDrawerStack: (routeName, params) => dispatch(doPushDrawerStack(routeName, params)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
  setSortByItem: item => dispatch(doSetSortByItem(item)),
});

export default connect(
  select,
  perform
)(TagPage);
