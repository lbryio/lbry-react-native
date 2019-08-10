import { connect } from 'react-redux';
import {
  doCheckPendingPublishes,
  doFetchClaimListMine,
  selectMyClaimUrisWithoutChannels,
  selectIsFetchingClaimListMine,
} from 'lbry-redux';
import { doPushDrawerStack, doSetPlayerVisible } from 'redux/actions/drawer';
import Constants from 'constants'; // eslint-disable-line node/no-deprecated-api
import PublishesPage from './view';

const select = state => ({
  uris: selectMyClaimUrisWithoutChannels(state),
  fetching: selectIsFetchingClaimListMine(state),
});

const perform = dispatch => ({
  fetchMyClaims: () => dispatch(doFetchClaimListMine()),
  checkPendingPublishes: () => dispatch(doCheckPendingPublishes()),
  pushDrawerStack: () => dispatch(doPushDrawerStack(Constants.DRAWER_ROUTE_PUBLISHES)),
  setPlayerVisible: () => dispatch(doSetPlayerVisible(false)),
});

export default connect(
  select,
  perform
)(PublishesPage);
