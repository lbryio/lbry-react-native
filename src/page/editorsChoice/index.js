import { connect } from 'react-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import { selectCurrentRoute } from 'redux/selectors/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import EditorsChoicePage from './view';

const select = state => ({
  currentRoute: selectCurrentRoute(state),
});

const perform = dispatch => ({
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_EDITORS_CHOICE)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(select, perform)(EditorsChoicePage);
