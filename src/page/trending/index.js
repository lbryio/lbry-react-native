import { connect } from 'react-redux';
import { selectFollowedTags } from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import TrendingPage from './view';

const select = state => ({
  currentRoute: selectCurrentRoute(state),
  followedTags: selectFollowedTags(state),
});

const perform = dispatch => ({
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_TRENDING)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(TrendingPage);
